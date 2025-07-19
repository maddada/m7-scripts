(function () {
    ("use strict");

    // State constants
    const SIDEPANEL_STATES = {
        PINNED: "pinned",
        OVERLAY: "overlay",
        HIDDEN: "hidden",
    };

    // State management
    let currentState = SIDEPANEL_STATES.OVERLAY;
    let previousState = null;
    let stateBeforeHidingVivaldiPanel = null;

    // Timeouts
    let expandTimeout = null;
    let collapseTimeout = null;

    // DOM elements
    let panelsContainer = null;
    let toggleButton = null;

    // Observers
    let buttonObserver = null;
    let toggleObserver = null;
    let panelObserver = null;

    // Configuration
    const config = {
        hiddenWidth: "34px",
        iconWidth: "72px",
        expandedWidth: "260px",
        fullWidth: "300px",
        expandDelay: 20,
        collapseDelay: 200,
        initCheckInterval: 800,
        reinitInterval: 5000,
    };

    // === INITIALIZATION ===
    function init() {
        console.log("Interval check running");

        panelsContainer = document.getElementById("panels-container");
        toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");

        if (!panelsContainer) {
            return false;
        }

        if (isAlreadyInitialized()) {
            console.log("Already loaded, skipping initialization");
            return true;
        }

        console.log("Found panels-container, initializing");
        updateVivaldiPanelWidth();
        markAsInitialized();
        setupToggleButton();
        setupButtonObserver();
        setupPanelWidthObserver();
        addSidebarButtonListeners();

        return true;
    }

    function isAlreadyInitialized() {
        return panelsContainer.getAttribute("data-mod-applied") === "true" && toggleButton?.getAttribute("data-mod-applied") === "true";
    }

    function markAsInitialized() {
        panelsContainer.setAttribute("data-mod-applied", "true");
    }

    // === STATE MANAGEMENT ===
    function setState(newState) {
        console.log("Setting state to:", newState);
        currentState = newState;

        switch (newState) {
            case SIDEPANEL_STATES.PINNED:
                removeEventListeners();
                removeStyles();
                panelsContainer.classList.remove("panel-expanded");
                addIconToToggleButton("⏺︎");
                console.log("State: PINNED");
                break;

            case SIDEPANEL_STATES.OVERLAY:
                applyStyles(config.iconWidth);
                addEventListeners();
                addIconToToggleButton("▶︎");
                console.log("State: OVERLAY");
                break;

            case SIDEPANEL_STATES.HIDDEN:
                applyStyles(config.hiddenWidth);
                addEventListeners();
                addIconToToggleButton("◁");
                console.log("State: HIDDEN");
                break;
        }
    }

    // === STYLES ===
    function applyStyles(sidebarWidth) {
        console.log("Applying styles with width:", sidebarWidth);

        const activeButton = getActiveSharpTabsButton();
        const actualWidth = activeButton ? sidebarWidth : config.hiddenWidth;

        console.log("Active button found:", !!activeButton, "Using width:", actualWidth);

        removeStyles();

        const styles = `
            :root {
                --width-1: ${config.fullWidth};
                --width-minimized: ${actualWidth};
                --width-hovered: ${config.expandedWidth};
            }
            #panels-container.panel-expanded {
                width: var(--width-1) !important;
            }
            #webview-container {
                padding-left: var(--width-minimized) !important;
            }
            #panels-container:not(.panel-expanded) {
                width: var(--width-minimized) !important;
            }
            #panels-container {
                position: absolute !important;
                height: calc(100vh - 83px) !important;
                transition: width 0.1s ease-in-out !important;
            }
            .panel-collapse-guard {
                min-width: var(--width-minimized) !important;
                max-width: var(--width-hovered) !important;
            }
            #panels-container.panel-expanded {
                width: var(--width-hovered) !important;
            }
        `;

        const styleElement = document.createElement("style");
        styleElement.id = "vivaldi-sidebar-styles";
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);

        console.log("Styles applied successfully");
    }

    function removeStyles() {
        const existingStyle = document.getElementById("vivaldi-sidebar-styles");
        if (existingStyle) existingStyle.remove();
    }

    // === EVENT LISTENERS ===
    function addEventListeners() {
        console.log("Adding event listeners");
        panelsContainer.addEventListener("mouseenter", handleMouseEnter);
        panelsContainer.addEventListener("mouseleave", handleMouseLeave);
        console.log("Event listeners added");
    }

    function removeEventListeners() {
        console.log("Removing event listeners");
        panelsContainer.removeEventListener("mouseenter", handleMouseEnter);
        panelsContainer.removeEventListener("mouseleave", handleMouseLeave);
        console.log("Event listeners removed");
    }

    // === MOUSE EVENTS ===
    function handleMouseEnter() {
        console.log("Mouse enter event triggered, current state:", currentState);
        if (currentState === SIDEPANEL_STATES.PINNED) return;

        clearTimeoutByType("collapse");

        if (!getActiveSharpTabsButton()) {
            console.log("No active button found, skipping expansion");
            return;
        }

        if (panelsContainer.classList.contains("panel-expanded")) {
            console.log("Panel already expanded, skipping timeout");
            return;
        }

        expandTimeout = setTimeout(() => {
            console.log("Expanding panel after 20ms delay");
            panelsContainer.classList.add("panel-expanded");
            expandTimeout = null;
        }, config.expandDelay);
    }

    function handleMouseLeave() {
        console.log("Mouse leave event triggered, current state:", currentState);
        if (currentState === SIDEPANEL_STATES.PINNED) return;

        clearTimeoutByType("expand");

        collapseTimeout = setTimeout(() => {
            console.log("Collapsing panel after 200ms delay");
            panelsContainer.classList.remove("panel-expanded");
            collapseTimeout = null;
        }, config.collapseDelay);
    }

    function clearTimeoutByType(type) {
        if (type === "expand" && expandTimeout) {
            clearTimeout(expandTimeout);
            expandTimeout = null;
            console.log("Cleared expand timeout");
        }
        if (type === "collapse" && collapseTimeout) {
            clearTimeout(collapseTimeout);
            collapseTimeout = null;
            console.log("Cleared collapse timeout");
        }
    }

    // === CLICK HANDLERS ===
    function handleLeftClick() {
        console.log("Left click - current state:", currentState);

        const transitions = {
            [SIDEPANEL_STATES.PINNED]: SIDEPANEL_STATES.OVERLAY,
            [SIDEPANEL_STATES.OVERLAY]: SIDEPANEL_STATES.PINNED,
            [SIDEPANEL_STATES.HIDDEN]: SIDEPANEL_STATES.PINNED,
        };

        setState(transitions[currentState]);
    }

    function handleMiddleClick() {
        console.log("Middle click - current state:", currentState);

        const transitions = {
            [SIDEPANEL_STATES.PINNED]: SIDEPANEL_STATES.HIDDEN,
            [SIDEPANEL_STATES.OVERLAY]: SIDEPANEL_STATES.HIDDEN,
            [SIDEPANEL_STATES.HIDDEN]: SIDEPANEL_STATES.OVERLAY,
        };

        setState(transitions[currentState]);
    }

    // === SIDEBAR BUTTON HANDLING ===
    function handleSidebarButtonClick(button) {
        console.log("Sidebar button clicked:", button);

        const isSharpTabsButton = button.matches(`button[aria-label="Sharp Tabs"], button[aria-label*="/sb.html"]`);
        const isActiveSharpTabsButton = isSharpTabsButton && button.closest(".button-toolbar.active");

        if (isSharpTabsButton) {
            if (isActiveSharpTabsButton) {
                console.log("Active Sharp Tabs button clicked, restoring to previous state:", previousState);
                if (previousState && previousState !== currentState) {
                    setState(previousState);
                    previousState = null;
                }
            } else {
                console.log("Inactive Sharp Tabs button clicked, doing nothing");
            }
        } else {
            console.log("Non-Sharp Tabs button clicked, saving current state and going to pinned");
            previousState = currentState;
            console.log("Saved previous state:", previousState);

            if (currentState !== SIDEPANEL_STATES.PINNED) {
                setState(SIDEPANEL_STATES.PINNED);
            }
        }
    }

    function addSidebarButtonListeners() {
        console.log("Adding sidebar button listeners");

        const sidebarButtons = document.querySelectorAll("#panels .button-toolbar button");
        console.log("Found sidebar buttons:", sidebarButtons.length);

        sidebarButtons.forEach((button) => {
            // Remove existing listeners to prevent duplicates
            if (button._sidebarClickHandler) {
                button.removeEventListener("click", button._sidebarClickHandler);
            }

            // Create new handler and store reference for later removal
            button._sidebarClickHandler = () => handleSidebarButtonClick(button);
            button.addEventListener("click", button._sidebarClickHandler);

            console.log("Added click listener to button:", button.getAttribute("aria-label") || button.textContent || "unnamed");
        });
    }

    // === TOGGLE BUTTON ===
    function setupToggleButton() {
        if (toggleButton) {
            attachToggleListeners();
            return;
        }

        waitForToggleElement();
    }

    function waitForToggleElement() {
        console.log("Setting up mutation observer for toggle button");

        toggleObserver = new MutationObserver((mutations, obs) => {
            toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
            console.log("Checking for toggle button:", toggleButton);

            if (toggleButton) {
                console.log("Toggle button found, adding click listeners");
                attachToggleListeners();
                obs.disconnect();
                console.log("Toggle button found and click listeners attached");
            }
        });

        toggleObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        console.log("Mutation observer started");
    }

    function attachToggleListeners() {
        toggleButton.addEventListener("click", (e) => {
            console.log("Toggle button clicked");
            handleLeftClick();
            e.preventDefault();
        });

        toggleButton.addEventListener("auxclick", (e) => {
            console.log("Toggle button middle click event triggered");
            if (e.button === 1) {
                handleMiddleClick();
                e.preventDefault();
            }
        });
    }

    function addIconToToggleButton(icon, dataModValue = "true") {
        if (!toggleButton) return;

        const svgContainer = document.createElement("div");
        svgContainer.style.cssText = "display: flex; flex-direction: column; align-items: center; height: 100%;";

        const svgElement = document.createElement("div");
        svgElement.innerHTML = icon;
        svgElement.style.cssText = "margin-top: 0; margin-bottom: auto;";

        svgContainer.appendChild(svgElement);
        toggleButton.style = "padding-top: 5px;";
        toggleButton.innerHTML = "";
        toggleButton.appendChild(svgContainer);
        toggleButton.setAttribute("data-mod-applied", dataModValue);
    }

    // === OBSERVERS ===
    function setupButtonObserver() {
        buttonObserver = new MutationObserver((mutations) => {
            let shouldReapplyStyles = false;
            let shouldReaddButtonListeners = false;

            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const target = mutation.target;
                    if (target.classList.contains("button-toolbar")) {
                        shouldReapplyStyles = true;
                    }
                }

                if (mutation.type === "childList") {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasNewButtons = addedNodes.some((node) => node.nodeType === Node.ELEMENT_NODE && (node.matches("button") || node.querySelector("button")));
                    if (hasNewButtons) {
                        shouldReaddButtonListeners = true;
                    }
                }
            });

            if (shouldReapplyStyles && getCurrentVivaldiSidebarWidth() !== "0px") {
                console.log("Button state changed, reapplying styles");
                if (currentState !== SIDEPANEL_STATES.PINNED) {
                    const currentWidth = currentState === SIDEPANEL_STATES.HIDDEN ? config.hiddenWidth : config.iconWidth;
                    applyStyles(currentWidth);
                } else {
                    console.log("In pinned state, not applying styles");
                }
            }

            if (shouldReaddButtonListeners) {
                console.log("New buttons detected, re-adding button listeners");
                setTimeout(() => {
                    addSidebarButtonListeners();
                }, 100);
            }
        });

        const panelsElement = document.getElementById("panels");
        if (panelsElement) {
            buttonObserver.observe(panelsElement, {
                attributes: true,
                attributeFilter: ["class"],
                childList: true,
                subtree: true,
            });
            console.log("Button state observer started");
        }
    }

    function setupPanelWidthObserver() {
        console.log("Setting up panel width observer");

        // Create observer to watch for style changes on panels-container
        panelObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                console.log("Panel element changed, mutation details:", mutation);
                if (mutation.type === "attributes" && mutation.attributeName === "style") {
                    updateVivaldiPanelWidth();
                }
            });
        });

        // Start observing
        panelObserver.observe(panelsContainer, {
            attributes: true,
            attributeFilter: ["style"],
        });

        console.log("Panel width observer started");
    }

    // === UTILITY METHODS ===
    function getCurrentVivaldiSidebarWidth() {
        const style = panelsContainer.getAttribute("style") || "";
        const match = style.match(/width:\s*(\d+(?:\.\d+)?px)/);
        return match ? match[1] : null;
    }

    function getActiveSharpTabsButton() {
        return document.querySelector('.button-toolbar.active > button[aria-label="Sharp Tabs"], .button-toolbar.active > button[aria-label*="/sb.html"]');
    }

    function updateVivaldiPanelWidth() {
        // Check current width of panels-container to determine initial state
        const currentWidth = getCurrentVivaldiSidebarWidth();

        console.log("Initial width check:", currentWidth);

        if (currentWidth === "0px") {
            // Width is 0px - initialize saved state to overlay and set current to pinned
            console.log("Initial width is 0px, setting to pinned with overlay saved");

            stateBeforeHidingVivaldiPanel = currentState;
            setState(SIDEPANEL_STATES.PINNED);
        } else {
            // Width is not 0px - initialize to overlay state
            console.log("Initial width is not 0px, setting to overlay");
            setState(stateBeforeHidingVivaldiPanel || SIDEPANEL_STATES.OVERLAY);
        }
    }

    // === CLEANUP ===
    function destroy() {
        // Clear timeouts
        clearTimeoutByType("expand");
        clearTimeoutByType("collapse");

        // Remove event listeners
        removeEventListeners();

        // Disconnect observers
        if (buttonObserver) {
            buttonObserver.disconnect();
        }
        if (toggleObserver) {
            toggleObserver.disconnect();
        }
        if (panelObserver) {
            panelObserver.disconnect();
        }

        // Remove styles
        removeStyles();

        console.log("Sidebar manager destroyed");
    }

    // === INITIALIZATION AND MANAGEMENT ===
    let initInterval;

    function initializeManager() {
        console.log("Attempting to initialize manager");

        if (init()) {
            console.log("Manager initialized successfully, clearing init interval");
            clearInterval(initInterval);

            // Set up periodic reinitialization to handle page changes
            setInterval(() => {
                init();
            }, config.reinitInterval);
        }
    }

    // === SCRIPT ENTRY POINT ===
    console.log("Vivaldi Sidebar Manager starting execution. Looking for panels-container to initialize styles on it.");
    initInterval = setInterval(initializeManager, config.initCheckInterval);
})();
