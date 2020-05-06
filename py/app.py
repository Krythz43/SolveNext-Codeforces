import requests
import csv
from operator import itemgetter

#Use your custom proxy and ignore this if you are not sure what to do.
http_proxy = "http://172.16.2.30:8080"
https_proxy = "https://172.16.2.30:8080"

proxy = { 
          "http": http_proxy, 
          "https": https_proxy,
        }


def initialize():
    users = ["nks43"]
    tags = []
    ROUND = 800
    ROUND_UPPER = 1290
    number_of_problems = 10
    lower_bound = 1800
    upper_bound = 4000
    return users, tags, ROUND, ROUND_UPPER, lower_bound, upper_bound, number_of_problems


def getData():
    link = "https://codeforces.com/api/problemset.problems?"
    # response=requests.get(link,proxies=proxy)
    # comment the above line if your network doesn't use a proxy

    response = requests.get(link)
    # uncomment the above line if your network doesn't use a proxy
    content = response.json()["result"]
    
    return content["problems"], content["problemStatistics"]


def modify(problems, stats, round, ROUND_UPPER):
    focus_problems = {}
    problem_count = 0

    for i in range(len(problems)):
        if problems[i]["contestId"] >= round and ROUND_UPPER >= problems[i]["contestId"] and 'rating' in problems[i].keys():
            focus_problems[problem_count] = problems[i]
            focus_problems[problem_count]["solved"] = stats[i]["solvedCount"]
            problem_count = problem_count + 1

    return focus_problems, problem_count


def sortProblems(problems):
    '''
    Sort according to the number of users solved
    '''
    problems_list = []

    for i in range(len(problems)):
        problems_list.append(problems[i])

    sorted_list = sorted(problems_list, key=itemgetter('solved'), reverse=True)
    return sorted_list


def safeStr(obj):
    '''
    Certain problems like Tree Generator TM have non-unicode characters which cannot be used as Dict keys and hence they are converted back to ascii
    '''
    try: 
        return str(obj)
    except UnicodeEncodeError:
        return obj.encode('ascii', 'ignore').decode('ascii')

    return ""


def filterProblems(problems, lower_bound, upper_bound):
    '''
    Filer between the ranges of problems
    parameters:
        problems list
        lower bound of rating
        upper bound of rating
    '''
    filtered_list = []
    for i in range(len(problems)):
        if(problems[i]["rating"] >= lower_bound and problems[i]["rating"] <= upper_bound):
            filtered_list.append(problems[i])

    return filtered_list


# TO SAVE TO A CSV FILE, UNCOMMENT ALL THE COMMENTED LINES IN BELOW FUNCTION


def save_list(problems, solved_check, number_of_problems):
    '''
    The problems are either saved or printed by editing this function.
    '''

    problem_count = 0
    TargetFile = open("rating1700.csv","a")
    with TargetFile:
        # writer = csv.writer(TargetFile)
        for problem in problems:
            if safeStr(problem["name"]) not in solved_check.keys():      #COMMENT THIS LINE TO DISPLAY SOLVED QUESTIONS ALSO
                # row = [str(problem["solved"]), str(problem["contestId"])+ str(problem["index"]), str(problem["rating"]), "https://codeforces.com/problemset/problem/"+str(problem["contestId"])+"/"+str(problem["index"]), safeStr(problem["name"]) ]
                text_console = "solved by:"+str(problem["solved"])+"\t"+str(problem["contestId"])+str(problem["index"])+"\trating:"+str(problem["rating"])+"\t https://codeforces.com/contest/"+str(problem["contestId"])+"/problem/"+str(problem["index"])+"\t"+safeStr(problem["name"])

                if(number_of_problems):
                    print(text_console)
                    number_of_problems = number_of_problems-1
                # writer.writerow(row)
                problem_count = problem_count+1
    TargetFile.close()    
    return problem_count


def get_solved(users):
    '''
    Requests all the problems solved by a user and marks them as solved and hence excluding them from the final list to be printed.
    '''
    solved_check = {}
    count = 0
    for user in users: 
        link = "https://codeforces.com/api/user.status?handle="+user
        # response=requests.get(link,proxies=proxy)
        # comment the above line if your network doesn't use a proxy

        response = requests.get(link)
        # uncomment the above line if your network doesn't use a proxy

        content = response.json()["result"]
        
        for i in range(len(content)):
            if content[i]["verdict"] == "OK":
                if safeStr(content[i]["problem"]["name"]) not in solved_check.keys():
                    count = count+1
                    solved_check[safeStr(content[i]["problem"]["name"])] = "true"
        
    return count, solved_check


def filter_problems_by_tags(problems, tags):

    required_list = []

    for problem in problems:
        for tag in tags:
            if tag in problem["tags"]:
                required_list.append(problem)
                break

    return required_list


if __name__ == "__main__":
    users, tags, ROUND, ROUND_UPPER,lower_bound, upper_bound, number_of_problems = initialize()
    problems_orig, stats_orig = getData()
    print("Total problems present :"+str(len(problems_orig)))
    print("Total problem stats :"+str(len(stats_orig)))

    focus_problems, problem_count = modify(problems_orig, stats_orig, ROUND,ROUND_UPPER)
    sorted_list = sortProblems(focus_problems)
    problems = filterProblems(sorted_list, lower_bound, upper_bound)
    if len(tags) > 0:
        problems = filter_problems_by_tags(problems, tags)
    
    solved_count, solved_check = get_solved(users)
    print("Number of problems solved is "+str(solved_count))
    print("Final list length: "+str(len(problems)))

    remaining_problems = save_list(problems, solved_check, number_of_problems)
    print("Problems solved in this category : " + str(len(problems) - remaining_problems))
    print("Remaining problems to solve in list:"+str(remaining_problems))
