# LilyPad

<img width="1728" alt="Screenshot 2024-10-15 at 12 38 53 PM" src="https://github.com/user-attachments/assets/6f3c2e9a-9844-44ad-b2c1-c6b42f0c3a53">

Check out the demo video on [vimeo](https://vimeo.com/1019853134?share=copy).


### Rules

1. Given `start` word and `end` word, find the shortest path between them.
2. Every intermediary on the path is a valid English word.
2. Valid operations:
   - Add letter (plant -> planet)
   - Remove letter (plant -> plan)
   - Swap letter (plant -> slant)

## Example 

`start` = 'bird'
`end` = 'plane'

Solution found in 5 steps:
'bird' -> 'bind' -> 'bine' -> 'bane' -> 'pane' -> 'plane'


