# Dialog Component
A [NextJS](https://nextjs.org/) component package for simplifying and standardizing the use of user dialog in NextJS apps.

## Installation
> $ npm i hauke5/dialog@latest


## Usage
### Defining a Dialog
A dialog is defined by teh `DialogConfig` structure, consisting of 
- a leading title to explain the purpose of the dialog to the user
- a list of dialog items, each consisting of a `DialogItemConfig` structure
- and a list of buttons to perform actions 

A simple dialog configuration might look like this:
```
{
   title: `Example:`,
   elements:[
      { 'Enter Valid Number:': { type:'number', initial: 0,  label:'Enter Valid Number:',  sideEffect:n}},
   ],
   buttons:[
      { OK: {}}, 
   ]
}
```