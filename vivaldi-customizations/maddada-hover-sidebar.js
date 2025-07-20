(function () {
    ("use strict");

    // Use configurable settings
    const config = {
        height: "calc(100vh - 83px)",
        hiddenWidth: "34px",
        minimizedWidth: "72px",
        expandedWidth: "260px",
        fullWidth: "300px",
        expandDelay: 20, // ms
        collapseDelay: 200, // ms
        initCheckInterval: 800, // ms
        reinitInterval: 5000, // ms
    };

    // State constants
    const SIDEPANEL_STATES = {
        PINNED: "pinned",
        OVERLAY: "overlay",
        HIDDEN: "hidden",
    };

    let firstInit = true;

    // Sidepanel state management
    let currentState = SIDEPANEL_STATES.OVERLAY;
    let previousState = null;

    let sharpTabsButtonClicked = false;

    // Panel Container state management
    let stateBeforeHidingPanelContainer = null;

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

    // === INITIALIZATION ===
    function init() {
        console.log("[init] Interval check running");

        panelsContainer = document.getElementById("panels-container");
        toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");

        if (!panelsContainer) {
            return false;
        }

        if (isAlreadyInitialized()) {
            console.log("[init] Already loaded, skipping initialization");
            return true;
        }

        console.log("[init] Found panels-container, initializing");
        reactToPanelContainerWidthModification();
        markAsInitialized();
        setupToggleButton();
        setupPanelWidthObserver();

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
        currentState = newState;

        switch (newState) {
            case SIDEPANEL_STATES.PINNED:
                removeEventListeners();
                removeStyles();
                panelsContainer.classList.remove("panel-expanded");
                addIconToToggleButton("⏺︎");
                console.log("[setState] Set state to PINNED");
                break;

            case SIDEPANEL_STATES.OVERLAY:
                applyStyles(config.minimizedWidth);
                addEventListeners();
                addIconToToggleButton("▶︎");
                console.log("[setState] Set state to OVERLAY");
                break;

            case SIDEPANEL_STATES.HIDDEN:
                applyStyles(config.hiddenWidth);
                addEventListeners();
                addIconToToggleButton("◁");
                console.log("[setState] Set state to HIDDEN");
                break;
        }
    }

    // === STYLES ===
    function applyStyles(sidebarWidth) {
        console.log("[applyStyles] Applying styles with width:", sidebarWidth);

        const activeButton = getActiveSharpTabsButton();
        const actualWidth = activeButton ? sidebarWidth : config.hiddenWidth;

        console.log("[applyStyles] Active button found:", !!activeButton, "Using width:", actualWidth);

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
                height: ${config.height} !important;
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

        console.log("[applyStyles] Styles applied successfully");
    }

    function removeStyles() {
        const existingStyle = document.getElementById("vivaldi-sidebar-styles");
        if (existingStyle) existingStyle.remove();
    }

    // === EVENT LISTENERS ===
    function addEventListeners() {
        console.log("[addEventListeners] Adding event listeners");
        panelsContainer.addEventListener("mouseenter", handleMouseEnter);
        panelsContainer.addEventListener("mouseleave", handleMouseLeave);
        console.log("[addEventListeners] Event listeners added");
    }

    function removeEventListeners() {
        console.log("[removeEventListeners] Removing event listeners");
        panelsContainer.removeEventListener("mouseenter", handleMouseEnter);
        panelsContainer.removeEventListener("mouseleave", handleMouseLeave);
        console.log("[removeEventListeners] Event listeners removed");
    }

    // === MOUSE EVENTS ===
    function handleMouseEnter() {
        console.log("[handleMouseEnter] Mouse enter event triggered, current state:", currentState);
        if (currentState === SIDEPANEL_STATES.PINNED) return;

        clearTimeoutByType("collapse");

        if (!getActiveSharpTabsButton()) {
            console.log("[handleMouseEnter] No active button found, skipping expansion");
            return;
        }

        if (panelsContainer.classList.contains("panel-expanded")) {
            console.log("[handleMouseEnter] Panel already expanded, skipping timeout");
            return;
        }

        expandTimeout = setTimeout(() => {
            console.log("[handleMouseEnter] Expanding panel after 20ms delay");
            panelsContainer.classList.add("panel-expanded");
            expandTimeout = null;
        }, config.expandDelay);
    }

    function handleMouseLeave() {
        console.log("[handleMouseLeave] Mouse leave event triggered, current state:", currentState);
        if (currentState === SIDEPANEL_STATES.PINNED) return;

        clearTimeoutByType("expand");

        collapseTimeout = setTimeout(() => {
            console.log("[handleMouseLeave] Collapsing panel after 200ms delay");
            panelsContainer.classList.remove("panel-expanded");
            collapseTimeout = null;
        }, config.collapseDelay);
    }

    function clearTimeoutByType(type) {
        if (type === "expand" && expandTimeout) {
            clearTimeout(expandTimeout);
            expandTimeout = null;
            console.log("[clearTimeoutByType] Cleared expand timeout");
        }
        if (type === "collapse" && collapseTimeout) {
            clearTimeout(collapseTimeout);
            collapseTimeout = null;
            console.log("[clearTimeoutByType] Cleared collapse timeout");
        }
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
        console.log("[waitForToggleElement] Setting up mutation observer for toggle button");

        toggleObserver = new MutationObserver((mutations, obs) => {
            toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
            console.log("[waitForToggleElement] Checking for toggle button:", toggleButton);

            if (toggleButton) {
                console.log("[waitForToggleElement] Toggle button found, adding click listeners");
                attachToggleListeners();
                obs.disconnect();
                console.log("[waitForToggleElement] Toggle button found and click listeners attached");
            }
        });

        toggleObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        console.log("[waitForToggleElement] Mutation observer started");
    }

    function attachToggleListeners() {
        toggleButton.addEventListener("click", (e) => {
            console.log("[attachToggleListeners] Toggle button clicked");
            e.preventDefault();

            console.log("[handleLeftClick] Left click - current state:", currentState);

            const transitions = {
                [SIDEPANEL_STATES.PINNED]: SIDEPANEL_STATES.OVERLAY,
                [SIDEPANEL_STATES.OVERLAY]: SIDEPANEL_STATES.PINNED,
                [SIDEPANEL_STATES.HIDDEN]: SIDEPANEL_STATES.PINNED,
            };

            if (transitions[currentState] === SIDEPANEL_STATES.PINNED) {
                console.log("[handleLeftClick] Setting state to PINNED from handleLeftClick function");
            }
            setState(transitions[currentState]);
        });

        toggleButton.addEventListener("auxclick", (e) => {
            console.log("[attachToggleListeners] Toggle button middle click event triggered");

            if (e.button === 1) {
                e.preventDefault();

                console.log("[handleMiddleClick] Middle click - current state:", currentState);

                const transitions = {
                    [SIDEPANEL_STATES.PINNED]: SIDEPANEL_STATES.HIDDEN,
                    [SIDEPANEL_STATES.OVERLAY]: SIDEPANEL_STATES.HIDDEN,
                    [SIDEPANEL_STATES.HIDDEN]: SIDEPANEL_STATES.OVERLAY,
                };

                setState(transitions[currentState]);
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

    function setupPanelWidthObserver() {
        console.log("[setupPanelWidthObserver] Setting up panel width observer");

        // Create observer to watch for style changes on panels-container
        panelObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                console.log("[setupPanelWidthObserver] Panel element changed, mutation details:", mutation);
                if (mutation.type === "attributes" && mutation.attributeName === "style") {
                    setTimeout(() => {
                        reactToPanelContainerWidthModification();
                    }, 50);
                }
            });
        });

        // Start observing
        panelObserver.observe(panelsContainer, {
            attributes: true,
            attributeFilter: ["style"],
        });

        console.log("[setupPanelWidthObserver] Panel width observer started");
    }

    // === UTILITY METHODS ===
    function getCurrentPanelContainerWidth() {
        const style = panelsContainer.getAttribute("style") || "";
        const match = style.match(/width:\s*(\d+(?:\.\d+)?px)/);
        return match ? match[1] : null;
    }

    function getActiveSharpTabsButton() {
        return document.querySelector('.button-toolbar.active > button[aria-label="Sharp Tabs"], .button-toolbar.active > button[aria-label*="/sb.html"]');
    }

    function reactToPanelContainerWidthModification() {
        // Check current width of panels-container to determine initial state
        const currentPanelContainerWidth = getCurrentPanelContainerWidth();

        console.log("[reactToPanelContainerWidthModification] Panel container width changed to:", currentPanelContainerWidth);

        // Check if user is manually resizing the panel
        const isManuallyResizing = panelsContainer.classList.contains("resizing");

        if (isManuallyResizing && currentState === SIDEPANEL_STATES.PINNED) {
            console.log("[reactToPanelContainerWidthModification] Manual resizing detected in pinned mode, maintaining current state");
            return;
        }

        stateBeforeHidingPanelContainer = currentState;

        if (currentPanelContainerWidth === "0px") {
            console.log("[reactToPanelContainerWidthModification] Initial width is 0px, setting to pinned with overlay saved");

            setState(SIDEPANEL_STATES.PINNED);
        } else if (firstInit) {
            firstInit = false;
            // Width is not 0px - initialize to overlay state
            console.log("[reactToPanelContainerWidthModification] Initial width is not 0px, setting to overlay");
            setState(stateBeforeHidingPanelContainer || SIDEPANEL_STATES.OVERLAY);
        } else {
            console.log("[reactToPanelContainerWidthModification] Initial width is not 0px, setting to pinned");
            setState(stateBeforeHidingPanelContainer);
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

        console.log("[destroy] Sidebar manager destroyed");
    }

    // === INITIALIZATION AND MANAGEMENT ===
    let initInterval;

    function initializeManager() {
        console.log("[initializeManager] Attempting to initialize manager");

        if (init()) {
            console.log("[initializeManager] Manager initialized successfully, clearing init interval");
            clearInterval(initInterval);

            // Set up periodic reinitialization to handle page changes
            setInterval(() => {
                init();
            }, config.reinitInterval);
        }
    }

    // === SCRIPT ENTRY POINT ===
    console.log("[SCRIPT START] Vivaldi Sidebar Manager starting execution. Looking for panels-container to initialize styles on it.");
    initInterval = setInterval(initializeManager, config.initCheckInterval);
})();
