# NCC Image Checker - Chrome Extension
Provides image optimisation information within the browser. 
The quality of layout for the information presented is strongly linked to markdown building techniques used.

## Install
[Download from the Chrome Extension Store](https://github.com/tabanliviu/image-checker)
or
1. Clone the ripo
2. Open [Chrome Extensions](chrome://extensions)
3. On the top right, check the checkbox for 'Developer mode'
3. Click 'Load unpacked extension...'
3. Select the directory where you have cloned this ripo

## Current limitations
1. the overlays are not responsive
2. overlay of background images where the element is positioned with negative values or via tranform will display as if the values were positive; why? the javascript api returns absolute values
3. overlay of carousel images will display for covered images as well
4. overlapping overlays hide eachother
5. file size for some cross origin images is not available (depends of support of perfromanceEntry)
6. sprites are not bad practice ... yet this tool flags them red, we don't handle them at all
