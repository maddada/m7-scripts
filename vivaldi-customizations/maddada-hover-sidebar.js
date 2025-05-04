(function () {
    "use strict";

    console.log("Script starting execution");
    let hoverSidebarEnabled = true;
    let hiddenSidebarWidth = "34px";
    let iconSidebarWidth = "72px";
    let sidebarWidth = `--width-minimized: ${iconSidebarWidth};`;

    const intervalId = setInterval(() => {
        console.log("Interval check running");

        const panelsContainer = document.getElementById("panels-container");
        console.log("Looking for panels-container:", panelsContainer);
        if (panelsContainer) {
            if (panelsContainer.getAttribute("data-mod-applied") === "true") {
                console.log("Already loaded, clearing interval");
                clearInterval(intervalId);
                return;
            }

            console.log("Found panels-container, clearing interval");
            clearInterval(intervalId);
            panelsContainer.setAttribute("data-mod-applied", true);

            let hoverTimer;
            let unhoverTimer;

            // Function to apply styles
            function applyStyles() {
                console.log("Applying styles");

                if (document.getElementById("vivaldi-sidebar-styles")) {
                    document.getElementById("vivaldi-sidebar-styles").remove();
                }

                const styleElement = document.createElement("style");
                styleElement.id = "vivaldi-sidebar-styles";
                styleElement.textContent = `
                    :root {
                        --width-1: 300px;
                        ${sidebarWidth}
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

                document.head.appendChild(styleElement);
                console.log("Styles applied successfully");
            }

            function toggleSidebarWidth() {
                console.log("Toggle sidebar width called, current state:", sidebarWidth.includes(iconSidebarWidth) ? "maximized" : "minimized");

                sidebarWidth = sidebarWidth.includes(iconSidebarWidth) ? `--width-minimized: ${hiddenSidebarWidth};` : `--width-minimized: ${iconSidebarWidth};`;

                if (hoverSidebarEnabled) {
                    applyStyles();
                }
            }

            // Function to toggle the feature on/off
            function toggleFeature() {
                console.log("Toggle feature called, current state:", hoverSidebarEnabled);
                hoverSidebarEnabled = !hoverSidebarEnabled;

                if (hoverSidebarEnabled) {
                    console.log("Enabling feature");
                    // Re-enable the feature
                    applyStyles();
                    addEventListeners();
                    document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible").style = "";

                    const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
                    toggleButton.innerHTML = ""; // Clear pinned icon

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

                    const pinIcon = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="27 27 200 200" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g><path style="opacity:0.973" fill="#fefffe" d="M 146.5,27.5 C 149.425,27.4598 152.091,28.2932 154.5,30C 178,53.5 201.5,77 225,100.5C 227.814,105.006 228.147,109.673 226,114.5C 217.167,123.333 208.333,132.167 199.5,141C 196.2,142.879 192.866,142.879 189.5,141C 187.65,138.982 185.65,137.149 183.5,135.5C 175.848,142.652 168.348,149.985 161,157.5C 161.728,165.782 162.228,174.116 162.5,182.5C 163.771,197.609 159.438,210.776 149.5,222C 145.634,224.12 141.967,223.786 138.5,221C 123.333,205.833 108.167,190.667 93,175.5C 76.1667,192.333 59.3333,209.167 42.5,226C 31.5126,229.343 27.3459,225.509 30,214.5C 47.014,197.653 63.8473,180.653 80.5,163.5C 65.5141,148.014 50.3474,132.681 35,117.5C 33.5432,114.634 33.2099,111.634 34,108.5C 40.8615,100.985 49.3615,96.485 59.5,95C 64.3258,94.4268 69.1592,93.9268 74,93.5C 82.2397,94.2405 90.4064,95.0738 98.5,96C 106.167,88.3333 113.833,80.6667 121.5,73C 118.96,70.7953 116.793,68.2953 115,65.5C 114.21,62.366 114.543,59.366 116,56.5C 125.784,46.211 135.95,36.5443 146.5,27.5 Z"/></g>
                    </svg>`;

                    const svgContainer = document.createElement("div");
                    svgContainer.style.cssText = "display: flex; flex-direction: column; align-items: center; height: 100%;";

                    const svgElement = document.createElement("div");
                    svgElement.innerHTML = pinIcon;
                    svgElement.style.cssText = "margin-top: 0; margin-bottom: auto;";

                    svgContainer.appendChild(svgElement);
                    toggleButton.appendChild(svgContainer);

                    console.log("Sidebar auto-expand disabled");
                }
            }

            // Define event handlers
            function handleMouseEnter() {
                console.log("Mouse enter event triggered, enabled:", hoverSidebarEnabled);
                if (!hoverSidebarEnabled) return;

                // Clear any existing timer when mouse enters
                clearTimeout(hoverTimer);
                clearTimeout(unhoverTimer);

                // Set a new timer for expansion
                console.log("Setting hover timer");
                hoverTimer = setTimeout(() => {
                    // After delay, add a class that will be used to expand the panel
                    console.log("Expanding panel");
                    panelsContainer.classList.add("panel-expanded");
                }, 100);
            }

            // function handleMouseEnter() {
            //     if (!hoverSidebarEnabled) return;
            //     panelsContainer.classList.add("panel-expanded");
            // }

            function handleMouseLeave() {
                if (!hoverSidebarEnabled) return;

                // Clear the timer when mouse leaves
                clearTimeout(hoverTimer);
                clearTimeout(unhoverTimer);

                // Remove the expanded class
                console.log("Setting unhover timer");
                unhoverTimer = setTimeout(() => {
                    console.log("Collapsing panel");
                    panelsContainer.classList.remove("panel-expanded");
                }, 300);
            }

            // Functions to add/remove event listeners
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

            // Function to wait for the toggle button element to be available
            function waitForToggleElement() {
                console.log("Setting up mutation observer for toggle button");
                // Set up a mutation observer to watch for the toggle button
                const observer = new MutationObserver((mutations, obs) => {
                    const toggleButton = document.querySelector("#panels #switch div.button-toolbar.toolbar-spacer-flexible");
                    console.log("Checking for toggle button:", toggleButton);
                    if (toggleButton) {
                        console.log("Toggle button found, adding click listener");
                        toggleButton.addEventListener("click", (e) => {
                            console.log("Toggle button clicked");
                            // click
                            toggleFeature();
                            e.preventDefault();
                        });

                        toggleButton.addEventListener("auxclick", (e) => {
                            console.log("Toggle button clicked");
                            // middleclick
                            toggleSidebarWidth();
                            e.preventDefault();
                        });

                        // Stop observing once the element is found
                        obs.disconnect();
                        console.log("Toggle button found and click listener attached");
                    }
                });

                // Start observing the document for changes
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
                console.log("Mutation observer started");
            }

            // Initial setup
            console.log("Starting initial setup");
            applyStyles();
            addEventListeners();
            waitForToggleElement();
            console.log("Initial setup complete");
        }
    }, 400);
    console.log("Interval set up to check for panels-container");
})();
