# Icon Picker for Foundry VTT

This module allows players (without file browse access) to use a visual icon picker UI to change the icons of items, features, spells and macros.

## Usage

Foundry core comes with hundreds of bundled icons you can use for many purposes, but for many players selecting them is not an option due to few GMs wanting to give players full file access. This module exposes selected directories of icons to the players. These are:

- `icons/commodities`, `icons/consumables`, `icons/containers`, `icons/creatures`, `icons/environment`, `icons/equipment`, `icons/magic`, `icons/skills`, `icons/sundries`, `icons/tools` and `icons/weapons` in Foundry application data
- If present, the contents of a directory called `icon-picker` under the foundry data root directory (next to `modules`, `systems` and `worlds`)
- If present, the contents of a directory called `icon-picker` under the currently running world

Clicking (right-clicking as the GM) on the icon slot on the relevant sheets opens the picker. You can navigate in the directory hierarchy and select an icon from a visual listing.

This functionality is available in the following dialogs

- The item sheet
- The active effect configuration sheet
- The macro configuration sheet

Technically, listing the files requires message passing to a Gamemaster user and will not work unless a GM is logged in. In practice, you'd only run into this situation on a remotely hosted always-on server. Nothing will break, but you'll have to wait for the GM to log on.

## License

This Foundry VTT module, written by Tero Parvinen, is licensed under a Creative Commons Attribution 4.0 International License.

This work is licensed under the Foundry Virtual Tabletop EULA - Limited License Agreement for module development.
