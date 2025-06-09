#!/bin/bash

# Author: debiedowner (Mac version)

# Change to the script's directory
cd "$(dirname "$0")"

# Vivaldi installation path
INSTALL_PATH="/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi/"

echo "## 1- Copying UserTheme folder"
# Create UserTheme directory if it doesn't exist
mkdir -p "${INSTALL_PATH}UserTheme"
# Copy UserTheme contents
cp -R UserTheme/* "${INSTALL_PATH}UserTheme/"

echo
echo "## 2- Locating window.html"
echo "Path: ${INSTALL_PATH}"

if [ ! -f "${INSTALL_PATH}window.html" ]; then
    echo "Error: window.html not found"
    exit 1
fi

echo
echo "## 3- Backing up window.html"

# Create backup if it doesn't exist
if [ ! -f "${INSTALL_PATH}window.bak.html" ]; then
    echo "Creating a backup of your original window.html file."
    cp "${INSTALL_PATH}window.html" "${INSTALL_PATH}window.bak.html"
fi

echo
echo "## 4- Copying js files and Patching window.html"

echo "Copying js files code to custom.js"
cat *.js > "${INSTALL_PATH}custom.js"

# Patch window.html
sed '/<\/body>/d; /<\/html>/d' "${INSTALL_PATH}window.bak.html" > "${INSTALL_PATH}window.html"
echo '    <script src="custom.js"></script>' >> "${INSTALL_PATH}window.html"
echo '  </body>' >> "${INSTALL_PATH}window.html"
echo '</html>' >> "${INSTALL_PATH}window.html"

echo
echo "## Done"
# echo "Press Enter to exit..."
# read
