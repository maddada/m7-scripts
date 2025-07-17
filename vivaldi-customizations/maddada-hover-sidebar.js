let intervalId;
let expandTimeout;
let collapseTimeout;
// sudo /Users/madda/dev/m7-scripts/vivaldi-customizations/main.sh
// sudo /Users/madda/dev/m7-scripts/vivaldi-customizations/main_snapshot.sh
const sidebarStyles = `
    :root {
        --width-1: 300px;
        --width-minimized: {currentSidebarWidth};
        --width-hovered: 260px;
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

// State management
const STATES = {
    PINNED: "pinned",
    OVERLAY: "overlay",
    HIDDEN: "hidden",
};

let currentState = STATES.OVERLAY;
let previousState = null; // To remember state before going to pinned due to button clicks

function addIconToSidebarButton(iconSVG, dataModValue = "true") {
    const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
    const svgContainer = document.createElement("div");
    svgContainer.style.cssText = "display: flex; flex-direction: column; align-items: center; height: 100%;";
    const svgElement = document.createElement("div");
    svgElement.innerHTML = iconSVG;
    svgElement.style.cssText = "margin-top: 0; margin-bottom: auto;";
    svgContainer.appendChild(svgElement);
    toggleButton.style = "padding-top: 5px;";
    toggleButton.innerHTML = "";
    toggleButton.appendChild(svgContainer);
    toggleButton.setAttribute("data-mod-applied", dataModValue);
}

function setState(newState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth) {
    console.log("Setting state to:", newState);
    currentState = newState;

    switch (newState) {
        case STATES.PINNED:
            // Disable hover functionality
            removeEventListeners();
            const styleElement = document.getElementById("vivaldi-sidebar-styles");
            if (styleElement) styleElement.remove();
            panelsContainer.classList.remove("panel-expanded");
            addIconToSidebarButton(`⏺︎`);
            console.log("State: PINNED");
            break;

        case STATES.OVERLAY:
            // Enable hover with overlay width
            applyStyles(iconSidebarWidth);
            addEventListeners();
            addIconToSidebarButton(`▶︎`);
            console.log("State: OVERLAY");
            break;

        case STATES.HIDDEN:
            // Enable hover with hidden width
            applyStyles(hiddenSidebarWidth);
            addEventListeners();
            addIconToSidebarButton(`◁`);
            console.log("State: HIDDEN");
            break;
    }
}

function handleLeftClick(setState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth) {
    console.log("Left click - current state:", currentState);

    if (currentState === STATES.PINNED) {
        setState(STATES.OVERLAY, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
    } else if (currentState === STATES.OVERLAY) {
        setState(STATES.PINNED, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
    } else if (currentState === STATES.HIDDEN) {
        // If somehow in hidden state, go to pinned when left clicking
        setState(STATES.PINNED, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
    }
}

function handleMiddleClick(setState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth) {
    console.log("Middle click - current state:", currentState);

    if (currentState === STATES.PINNED) {
        setState(STATES.HIDDEN, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
    } else if (currentState === STATES.OVERLAY) {
        setState(STATES.HIDDEN, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
    } else if (currentState === STATES.HIDDEN) {
        setState(STATES.OVERLAY, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
    }
}

function handleSidebarButtonClick(button, setState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth) {
    console.log("Sidebar button clicked:", button);

    const isSharpTabsButton = button.matches(`button[aria-label="Sharp Tabs"]`);
    const isActiveSharpTabsButton = isSharpTabsButton && button.closest(".button-toolbar.active");

    if (isSharpTabsButton) {
        if (isActiveSharpTabsButton) {
            console.log("Active Sharp Tabs button clicked, restoring to previous state:", previousState);
            // If clicking active Sharp Tabs button, restore to previous state
            if (previousState && previousState !== currentState) {
                setState(previousState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
                previousState = null; // Clear the saved state
            }
        } else {
            console.log("Inactive Sharp Tabs button clicked, doing nothing");
            // If clicking inactive Sharp Tabs button, do nothing
        }
    } else {
        console.log("Non-Sharp Tabs button clicked, saving current state and going to pinned");
        // If clicking any other button, always save current state (even if already pinned) and ensure we're in pinned state
        previousState = currentState;
        console.log("Saved previous state:", previousState);
        // Only call setState if we're not already in pinned state to avoid unnecessary operations
        if (currentState !== STATES.PINNED) {
            setState(STATES.PINNED, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
        }
    }
}

function addSidebarButtonListeners(setState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth) {
    console.log("Adding sidebar button listeners");

    // Add event listeners to all buttons in the sidebar
    const sidebarButtons = document.querySelectorAll("#panels .button-toolbar button");
    console.log("Found sidebar buttons:", sidebarButtons.length);

    sidebarButtons.forEach((button) => {
        // Remove existing listeners to prevent duplicates
        button.removeEventListener("click", button._sidebarClickHandler);

        // Create new handler and store reference for later removal
        button._sidebarClickHandler = (e) => {
            handleSidebarButtonClick(button, setState, applyStyles, addEventListeners, removeEventListeners, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
        };

        button.addEventListener("click", button._sidebarClickHandler);
        console.log("Added click listener to button:", button.getAttribute("aria-label") || button.textContent || "unnamed");
    });
}

function handleMouseEnter(panelsContainer) {
    console.log("Mouse enter event triggered, current state:", currentState);
    if (currentState === STATES.PINNED) return;

    // Clear any pending collapse timeout
    if (collapseTimeout) {
        clearTimeout(collapseTimeout);
        collapseTimeout = null;
        console.log("Cleared collapse timeout");
    }

    // Check if there's no active button - if so, don't expand the sidebar
    const activeButton = document.querySelector(`.button-toolbar.active > button[aria-label="Sharp Tabs"]`);
    if (!activeButton) {
        console.log("No active button found, skipping expansion");
        return;
    }

    // If already expanded, don't set a new timeout
    if (panelsContainer.classList.contains("panel-expanded")) {
        console.log("Panel already expanded, skipping timeout");
        return;
    }

    // Set expand timeout
    expandTimeout = setTimeout(() => {
        console.log("Expanding panel after 20ms delay");
        panelsContainer.classList.add("panel-expanded");
        expandTimeout = null;
    }, 20);
}

function handleMouseLeave(panelsContainer) {
    console.log("Mouse leave event triggered, current state:", currentState);
    if (currentState === STATES.PINNED) return;

    // Clear any pending expand timeout
    if (expandTimeout) {
        clearTimeout(expandTimeout);
        expandTimeout = null;
        console.log("Cleared expand timeout");
    }

    // Set collapse timeout
    collapseTimeout = setTimeout(() => {
        console.log("Collapsing panel after 300ms delay");
        panelsContainer.classList.remove("panel-expanded");
        collapseTimeout = null;
    }, 300);
}

function addEventListeners(panelsContainer, handleMouseEnterFn, handleMouseLeaveFn) {
    console.log("Adding event listeners");
    panelsContainer.addEventListener("mouseenter", handleMouseEnterFn);
    panelsContainer.addEventListener("mouseleave", handleMouseLeaveFn);
    console.log("Event listeners added");
}

function removeEventListeners(panelsContainer, handleMouseEnterFn, handleMouseLeaveFn) {
    console.log("Removing event listeners");
    panelsContainer.removeEventListener("mouseenter", handleMouseEnterFn);
    panelsContainer.removeEventListener("mouseleave", handleMouseLeaveFn);
    console.log("Event listeners removed");
}

function waitForToggleElement(handleLeftClickFn, handleMiddleClickFn) {
    console.log("Setting up mutation observer for toggle button");
    const observer = new MutationObserver((mutations, obs) => {
        const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
        console.log("Checking for toggle button:", toggleButton);
        if (toggleButton) {
            console.log("Toggle button found, adding click listeners");
            toggleButton.addEventListener("click", (e) => {
                console.log("Toggle button clicked");
                handleLeftClickFn();
                e.preventDefault();
            });
            toggleButton.addEventListener("auxclick", (e) => {
                console.log("Toggle button middle click event triggered");
                if (e.button === 1) {
                    handleMiddleClickFn();
                    e.preventDefault();
                }
            });
            obs.disconnect();
            console.log("Toggle button found and click listeners attached");
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
    console.log("Mutation observer started");
}

function initHoverSidebar() {
    let hiddenSidebarWidth = "34px";
    let iconSidebarWidth = "72px";

    console.log("Interval check running");
    const panelsContainer = document.getElementById("panels-container");
    const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
    console.log("Looking for panels-container:", panelsContainer);

    if (panelsContainer) {
        if (panelsContainer.getAttribute("data-mod-applied") === "true" && toggleButton && toggleButton.getAttribute("data-mod-applied") === "true") {
            console.log("Already loaded, clearing interval");
            clearInterval(intervalId);
            return;
        }

        console.log("Found panels-container, clearing interval");
        clearInterval(intervalId);
        panelsContainer.setAttribute("data-mod-applied", true);

        function applyStyles(currentSidebarWidth) {
            console.log("Applying styles with width:", currentSidebarWidth);

            // Check if there's an active button - if not, set width to 0
            const activeButton = document.querySelector(".button-toolbar.active > button[aria-label='Sharp Tabs']");
            const actualWidth = activeButton ? currentSidebarWidth : "34px";

            console.log("Active button found:", !!activeButton, "Using width:", actualWidth);

            const existingStyleElement = document.getElementById("vivaldi-sidebar-styles");
            if (existingStyleElement) {
                existingStyleElement.remove();
            }
            const styleElement = document.createElement("style");
            styleElement.id = "vivaldi-sidebar-styles";
            styleElement.textContent = sidebarStyles.replace("{currentSidebarWidth}", actualWidth);
            document.head.appendChild(styleElement);
            console.log("Styles applied successfully");
        }

        // Create bound functions for event handlers
        const handleMouseEnterFn = () => handleMouseEnter(panelsContainer);
        const handleMouseLeaveFn = () => handleMouseLeave(panelsContainer);

        const addEventListenersFn = () => {
            addEventListeners(panelsContainer, handleMouseEnterFn, handleMouseLeaveFn);
        };

        const removeEventListenersFn = () => {
            removeEventListeners(panelsContainer, handleMouseEnterFn, handleMouseLeaveFn);
        };

        const setStateFn = (newState) => {
            setState(newState, applyStyles, addEventListenersFn, removeEventListenersFn, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
        };

        const handleLeftClickFn = () => {
            handleLeftClick(setStateFn, applyStyles, addEventListenersFn, removeEventListenersFn, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
        };

        const handleMiddleClickFn = () => {
            handleMiddleClick(setStateFn, applyStyles, addEventListenersFn, removeEventListenersFn, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
        };

        // Initial setup - start in overlay state
        console.log("Starting initial setup");
        setStateFn(STATES.OVERLAY);
        waitForToggleElement(handleLeftClickFn, handleMiddleClickFn);

        // Watch for changes in active button state to update width dynamically
        const buttonObserver = new MutationObserver((mutations) => {
            let shouldReapplyStyles = false;
            let shouldReaddButtonListeners = false;

            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const target = mutation.target;
                    if (target.classList.contains("button-toolbar")) {
                        shouldReapplyStyles = true;
                    }
                }

                // Check if new buttons were added
                if (mutation.type === "childList") {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasNewButtons = addedNodes.some((node) => node.nodeType === Node.ELEMENT_NODE && (node.matches("button") || node.querySelector("button")));
                    if (hasNewButtons) {
                        shouldReaddButtonListeners = true;
                    }
                }
            });

            if (shouldReapplyStyles) {
                console.log("Button state changed, reapplying styles");
                // Only reapply styles if not in pinned state
                if (currentState !== STATES.PINNED) {
                    const currentWidth = currentState === STATES.HIDDEN ? hiddenSidebarWidth : iconSidebarWidth;
                    applyStyles(currentWidth);
                } else {
                    console.log("In pinned state, not applying styles");
                }
            }

            if (shouldReaddButtonListeners) {
                console.log("New buttons detected, re-adding button listeners");
                setTimeout(() => {
                    addSidebarButtonListeners(setStateFn, applyStyles, addEventListenersFn, removeEventListenersFn, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);
                }, 100); // Small delay to ensure DOM is fully updated
            }
        });

        // Observe the panels container for button state changes and new buttons
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

        // Add listeners for sidebar buttons
        addSidebarButtonListeners(setStateFn, applyStyles, addEventListenersFn, removeEventListenersFn, panelsContainer, hiddenSidebarWidth, iconSidebarWidth);

        console.log("Initial setup complete");

        setInterval(initHoverSidebar, 5000);
    }
}

(function () {
    "use strict";
    console.log("Script starting execution");
    intervalId = setInterval(initHoverSidebar, 800);
    console.log("Interval set up to check for panels-container");
})();
