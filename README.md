# conway
> An implementation of Conway's Game of Life with two modes, interactive controls, custom scenarios, and a scenario editor, all written in pure Node.JS with zero external dependencies

## Installation
Just clone the repository

    $ git clone https://github.com/Rayzr522/conway.git

## Usage
From inside the repository folder, you can run the following commands:

### Player

    $ node conway
    # OR
    $ node conway <scenario file>
    # Example:
    $ node conway example/mushroom

### Editor

    $ node editor
    # OR
    $ node editor <scenario file>
    # Example:
    $ node editor example/continent
    
## Controls
### Player
Key | Action
----|-------
<kbd>H</kbd> or <kbd>?</kbd> | Shows the help screen
Space | Toggles modes between Auto and Manual
<kbd>+</kbd> | Increases FPS by 1, hold shift to increase by 5
<kbd>-</kbd> | Decreases FPS by 1, hold shift to decrease by 5
<kbd>CTRL+O</kbd> | Opens a different data file
<kbd>CTRL+C</kbd> or <kbd>Q</kbd> | Quits Conway's Game of Life
Enter/Return  | Goes forward 1 year
Left Arrow Key | Goes back 1 year, hold shift to go back 5 years
Right Arrow Key | Goes forward 1 year, hold shift to go forward 5 years
<kbd>0</kbd> | Goes back to year 0
<kbd>9</kbd> | Goes to the final year

### Editor
Press <kbd>CTRL+C</kbd> or <kbd>CTRL+D</kbd> to quit at any time.
#### Main Menu
Key | Action
----|-------
Up/Down Arrow | Navigate menus
#### Scenario Editor
Key | Action
----|-------
Up/Down/Left/Right Arrow | Move around scenario grid
Space | Toggle state of cell
<kbd>CTRL+S</kbd> | Saves the scenario to the scenario file
<kbd>CTRL+R</kbd> | Reloads the scenario from the scenario file 
<kbd>CTRL+W</kbd> or <kbd>CTRL+Q</kbd> | Quits back to the main menu