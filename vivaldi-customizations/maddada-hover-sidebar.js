let intervalId;

const sidebarStyles = `
    :root {
        --width-1: 300px;
        --width-minimized: {currentSidebarWidth};
        --width-hovered: 259px;
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
        height: calc(100vh - 76px) !important;
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

// Extracted functions
function toggleSidebarWidth(sidebarWidth, iconSidebarWidth, hiddenSidebarWidth, hoverSidebarEnabled, applyStyles) {
    console.log("Toggle sidebar width called, current state:", sidebarWidth === iconSidebarWidth ? "maximized" : "minimized");
    let newSidebarWidth = sidebarWidth === iconSidebarWidth ? hiddenSidebarWidth : iconSidebarWidth;
    if (hoverSidebarEnabled) {
        applyStyles(newSidebarWidth);
    }
    return newSidebarWidth;
}

function toggleFeature(hoverSidebarEnabled, applyStyles, addEventListeners, removeEventListeners, panelsContainer, iconSidebarWidth, hiddenSidebarWidth, sidebarWidth) {
    console.log("Toggle feature called, current state:", hoverSidebarEnabled);
    hoverSidebarEnabled = !hoverSidebarEnabled;
    if (hoverSidebarEnabled) {
        console.log("Enabling feature");
        applyStyles(sidebarWidth);
        addEventListeners();
        document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible").style = "";
        const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
        toggleButton.innerHTML = "";
        console.log("Sidebar auto-expand enabled");
    } else {
        console.log("Disabling feature");
        removeEventListeners();
        const styleElement = document.getElementById("vivaldi-sidebar-styles");
        if (styleElement) styleElement.remove();
        panelsContainer.classList.remove("panel-expanded");
        const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
        console.log("Toggle button found:", toggleButton);
        toggleButton.style = "padding-top: 5px;";
        toggleButton.innerHTML = "";

        const pinIcon = `<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"16\" height=\"16\" viewBox=\"27 27 200 200\" style=\"shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><g><path style=\"opacity:0.973\" fill=\"#fefffe\" d=\"M 146.5,27.5 C 149.425,27.4598 152.091,28.2932 154.5,30C 178,53.5 201.5,77 225,100.5C 227.814,105.006 228.147,109.673 226,114.5C 217.167,123.333 208.333,132.167 199.5,141C 196.2,142.879 192.866,142.879 189.5,141C 187.65,138.982 185.65,137.149 183.5,135.5C 175.848,142.652 168.348,149.985 161,157.5C 161.728,165.782 162.228,174.116 162.5,182.5C 163.771,197.609 159.438,210.776 149.5,222C 145.634,224.12 141.967,223.786 138.5,221C 123.333,205.833 108.167,190.667 93,175.5C 76.1667,192.333 59.3333,209.167 42.5,226C 31.5126,229.343 27.3459,225.509 30,214.5C 47.014,197.653 63.8473,180.653 80.5,163.5C 65.5141,148.014 50.3474,132.681 35,117.5C 33.5432,114.634 33.2099,111.634 34,108.5C 40.8615,100.985 49.3615,96.485 59.5,95C 64.3258,94.4268 69.1592,93.9268 74,93.5C 82.2397,94.2405 90.4064,95.0738 98.5,96C 106.167,88.3333 113.833,80.6667 121.5,73C 118.96,70.7953 116.793,68.2953 115,65.5C 114.21,62.366 114.543,59.366 116,56.5C 125.784,46.211 135.95,36.5443 146.5,27.5 Z"/></g></svg>`;

        const svgContainer = document.createElement("div");
        svgContainer.style.cssText = "display: flex; flex-direction: column; align-items: center; height: 100%;";
        const svgElement = document.createElement("div");
        svgElement.innerHTML = pinIcon;
        svgElement.style.cssText = "margin-top: 0; margin-bottom: auto;";
        svgContainer.appendChild(svgElement);
        toggleButton.appendChild(svgContainer);
        toggleButton.setAttribute("data-mod-applied", "true");
        console.log("Sidebar auto-expand disabled");
    }
    return hoverSidebarEnabled;
}

function handleMouseEnter(hoverSidebarEnabled, hoverTimer, unhoverTimer, panelsContainer) {
    console.log("Mouse enter event triggered, enabled:", hoverSidebarEnabled);
    if (!hoverSidebarEnabled) return hoverTimer;
    clearTimeout(hoverTimer);
    clearTimeout(unhoverTimer);
    console.log("Setting hover timer");
    hoverTimer = setTimeout(() => {
        console.log("Expanding panel");
        panelsContainer.classList.add("panel-expanded");
    }, 100);
    return hoverTimer;
}

function addEventListeners(panelsContainer, handleMouseEnterFn, handleMouseLeaveFn) {
    console.log("Adding event listeners");
    panelsContainer.addEventListener("mouseenter", handleMouseEnterFn);
    panelsContainer.addEventListener("mouseleave", handleMouseLeaveFn);
    console.log("Event listeners added");
}

function waitForToggleElement(toggleFeatureFn, toggleSidebarWidthFn) {
    console.log("Setting up mutation observer for toggle button");
    const observer = new MutationObserver((mutations, obs) => {
        const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
        console.log("Checking for toggle button:", toggleButton);
        if (toggleButton) {
            console.log("Toggle button found, adding click listener");
            toggleButton.addEventListener("click", (e) => {
                console.log("Toggle button clicked");
                toggleFeatureFn();
                e.preventDefault();
            });
            toggleButton.addEventListener("auxclick", (e) => {
                console.log("Toggle button middle click event triggered");
                if (e.button === 1) {
                    toggleSidebarWidthFn();
                    e.preventDefault();
                }
            });
            obs.disconnect();
            console.log("Toggle button found and click listener attached");
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
    console.log("Mutation observer started");
}

function initHoverSidebar() {
    let hoverSidebarEnabled = true;
    let hiddenSidebarWidth = "34px";
    let iconSidebarWidth = "72px";
    let sidebarWidth = iconSidebarWidth;
    console.log("Interval check running");
    const panelsContainer = document.getElementById("panels-container");
    const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
    console.log("Looking for panels-container:", panelsContainer);
    if (panelsContainer) {
        if (panelsContainer.getAttribute("data-mod-applied") === "true" && toggleButton.getAttribute("data-mod-applied") === "true") {
            console.log("Already loaded, clearing interval");
            clearInterval(intervalId);
            return;
        }
        console.log("Found panels-container, clearing interval");
        clearInterval(intervalId);
        panelsContainer.setAttribute("data-mod-applied", true);
        let hoverTimer;
        let unhoverTimer;
        function applyStyles(currentSidebarWidth) {
            console.log("Applying styles");
            if (document.getElementById("vivaldi-sidebar-styles")) {
                document.getElementById("vivaldi-sidebar-styles").remove();
            }
            const styleElement = document.createElement("style");
            styleElement.id = "vivaldi-sidebar-styles";
            styleElement.textContent = sidebarStyles.replace("{currentSidebarWidth}", currentSidebarWidth);
            document.head.appendChild(styleElement);
            console.log("Styles applied successfully");
        }
        function handleMouseLeave() {
            if (!hoverSidebarEnabled) return;
            clearTimeout(hoverTimer);
            clearTimeout(unhoverTimer);
            console.log("Setting unhover timer");
            unhoverTimer = setTimeout(() => {
                console.log("Collapsing panel");
                panelsContainer.classList.remove("panel-expanded");
            }, 300);
        }
        // Use the extracted functions with dependencies
        const handleMouseEnterFn = () => {
            hoverTimer = handleMouseEnter(hoverSidebarEnabled, hoverTimer, unhoverTimer, panelsContainer);
        };
        const handleMouseLeaveFn = handleMouseLeave;
        const addEventListenersFn = () => {
            addEventListeners(panelsContainer, handleMouseEnterFn, handleMouseLeaveFn);
        };
        const removeEventListeners = () => {
            console.log("Removing event listeners");
            panelsContainer.removeEventListener("mouseenter", handleMouseEnterFn);
            panelsContainer.removeEventListener("mouseleave", handleMouseLeaveFn);
            console.log("Event listeners removed");
        };
        const toggleSidebarWidthFn = () => {
            sidebarWidth = toggleSidebarWidth(sidebarWidth, iconSidebarWidth, hiddenSidebarWidth, hoverSidebarEnabled, applyStyles);
        };
        const toggleFeatureFn = () => {
            hoverSidebarEnabled = toggleFeature(hoverSidebarEnabled, applyStyles, addEventListenersFn, removeEventListeners, panelsContainer, iconSidebarWidth, hiddenSidebarWidth, sidebarWidth);
        };
        // Initial setup
        console.log("Starting initial setup");
        applyStyles(sidebarWidth);
        addEventListenersFn();
        waitForToggleElement(toggleFeatureFn, toggleSidebarWidthFn);
        console.log("Initial setup complete");
        setInterval(initHoverSidebar, 5000);
    }
}

(function () {
    "use strict";
    console.log("Script starting execution");
    intervalId = setInterval(initHoverSidebar, 400);
    console.log("Interval set up to check for panels-container");
})();
