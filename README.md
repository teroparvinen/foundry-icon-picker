# Icon Picker for Foundry VTT

This module allows players (without file browse access) to use a visual icon picker UI to change the icons of items, features, spells and macros.

## Usage

Foundry core and the dnd5e system come with hundreds of bundled icons you can use for many purposes, but for many players selecting them is not an option due to few GMs wanting to give players full file access. This module exposes selected directories of icons to the players. These are:

- `icons/commodities`, `icons/consumables`, `icons/containers`, `icons/creatures`, `icons/environment`, `icons/equipment`, `icons/magic`, `icons/skills`, `icons/sundries`, `icons/tools` and `icons/weapons` in Foundry application data
- `systems/dnd5e/icons/items`, `systems/dnd5e/icons/skills` and `systems/dnd5e/icons/spells` in the dnd5e system

Clicking on the icon slot on the relevant sheets opens the picker. You can navigate in the directory hierarchy and select an icon from a visual listing.

Technically, listing the files requires message passing to a Gamemaster user and will not work unless a GM is logged in. In practice, you'd only run into this situation on a remotely hosted always-on server. Nothing will break, but you'll have to wait for the GM to log on.

## License

This Foundry VTT module, written by Tero Parvinen, is licensed under a Creative Commons Attribution 4.0 International License.

This work is licensed under the Foundry Virtual Tabletop EULA - Limited License Agreement for module development.
