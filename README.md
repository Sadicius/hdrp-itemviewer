## HDRP-ItemViewer
HDRP-ItemViewer is a visual tool for Unity (compatible with High Definition Render Pipeline - HDRP) that allows players to explore and query all available items on the game server. Additionally, if the user has administrator permissions, they can use the tool to issue items directly to other players.

# Features
🔍 Item View: Browse and search for available items on the server with a clear and organized interface.

📦 Full Details: View detailed information about each item (name, description, ID, category, etc.).

🎮 Item Delivery: Administrators can select an item and assign it to a player directly from the tool.

🔐 Access Control: Delivery functionality is only enabled for users with administrator permissions.

💡 HDRP Integration: Designed to work with projects that use HDRP, offering a modern and fluid visual experience.

# Requirements
rsg-core
ox_lib

Connection to the server hosting the item data

Make sure you have HDRP configured correctly in your project.

Integrate the scripts and prefabs into your scene.
Set up the connection to your server and the permissions system.

# Usage
Open /openitemviewer the ItemViewer main scene.
Use the search or navigation panel to browse items.
If you are an administrator, you will see the "Submit Item" option when selecting one.

Select the player from a list and click "Accept".

# Security
Item submission is protected and requires validation of the administrator role.

# Contributions
Contributions are welcome. If you wish to propose improvements or fix bugs, please open an issue or submit a pull request.

# License
This project is licensed under the MIT License.