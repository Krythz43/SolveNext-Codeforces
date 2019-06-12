# SolveNext-Codeforces

Creates a list of recent problems given rating of the user

### How to use

- In the initialize function, change the username to your username. This makes sure the problems solved by you dont appear on the list
- In the save_list function, uncomment the commented lines if you want to save it to a .txt file.
- Adjust rating in the lower_bound part of initialize function
- run ```python3 app.py```

and thats all you need to do!

### Additional Features

- FILTER BY TAGS: In the initialize function, you can add the tags that you want in the ```tags=[]``` list to get problems from that particular codeforces tag. For example if you want to solve problems from dp, add it as ```tags=["dp"]``` and if you want to solve problems from dp and greedy, add it as ```tags=["dp",greedy"]```.
- MULTIPLE USERS: Suppose you are practising as a team or if you have multiple accounts which you want the app to consider, then in the initialize function, under the ```users=["your_user_name"]``` section, add your friends username along with yours. for example ```users=["Your_name","Your_team_mate","Your_second_account"]```. (Thanks [pshishod2645](codeforces.com/profile/pshishod2645)! )

### Future Developmental plans

The whole app could be converted to a web app for easier usage. Pull Requests are invited!

### Credits

Thanks to [pshishod2645](codeforces.com/profile/pshishod2645) for the idea and Mike Mirzayanov for the amazing platform!