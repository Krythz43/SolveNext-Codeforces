import requests
import csv
from operator import itemgetter



def initialize():
    users=["nks43"]
    ROUND=1000
    lower_bound=1700
    upper_bound=4000
    return users,ROUND,lower_bound,upper_bound





def getData():
    link="https://codeforces.com/api/problemset.problems?"
    response=requests.get(link)
    content=response.json()["result"]
    
    return content["problems"],content["problemStatistics"]




def modify(problems,stats,round):
    focus_problems={}
    problem_count=0

    for i in range (len(problems)):
        if problems[i]["contestId"]>=round and 'rating' in problems[i].keys():
            focus_problems[problem_count]=problems[i]
            focus_problems[problem_count]["solved"]=stats[i]["solvedCount"]
            problem_count=problem_count+1

    return focus_problems,problem_count




def sortProblems(problems):
    '''
    Sort according to the number of users solved
    '''
    problems_list=[]

    for i in range (len(problems)):
        problems_list.append(problems[i])

    sorted_list=sorted(problems_list,key=itemgetter('solved'),reverse=True)
    return sorted_list





def safeStr(obj):
    try: return str(obj)
    except UnicodeEncodeError:
        return obj.encode('ascii', 'ignore').decode('ascii')
    except: return ""





def filterProblems(problems,lower_bound,upper_bound):
    '''
    Filer between the ranges of problems
    parameters:
        problems list
        lower bound of rating
        upper bound of rating
    '''
    filtered_list=[]
    for i in range(len(problems)):
        if(problems[i]["rating"]>=lower_bound and problems[i]["rating"]<=upper_bound):
            filtered_list.append(problems[i])

    return filtered_list



#
# TO SAVE TO A TXT FILE, UNCOMMENT ALL THE COMMENTED LINES IN BELOW FUNCTION
#

def save_list(problems,solved_check):

    problem_count=0
    TargetFile=open("rating1700.csv","a")
    with TargetFile : 
        writer = csv.writer(TargetFile)
        for problem in problems:
            if safeStr(problem["name"]) not in solved_check.keys():      #COMMENT THIS LINE TO DISPLAY SOLVED QUESTIONS ALSO
                text="\t"+str(problem["solved"])+"\t"+str(problem["contestId"])+str(problem["index"])+"\t:"+str(problem["rating"])+"\t https://codeforces.com/problemset/problem/"+str(problem["contestId"])+"/"+str(problem["index"])+"\t"+safeStr(problem["name"]+'\n')
                row = [str(problem["solved"]), str(problem["contestId"])+ str(problem["index"]), str(problem["rating"]), "https://codeforces.com/problemset/problem/"+str(problem["contestId"])+"/"+str(problem["index"]), safeStr(problem["name"]) ]
                print(text)
                #writer.writerow(row)
                problem_count=problem_count+1
    
    return problem_count




def get_solved(users):
    
    solved_check={}
    count=0
    for user in users : 
        link="https://codeforces.com/api/user.status?handle="+user
        response=requests.get(link)
        content=response.json()["result"]
        
        for i in range (len(content)):
            if content[i]["verdict"]=="OK":
                if safeStr(content[i]["problem"]["name"]) not in solved_check.keys():
                    count=count+1
                    solved_check[safeStr(content[i]["problem"]["name"])]="true"
        
    return count,solved_check



if __name__ == "__main__":
    users,ROUND,lower_bound,upper_bound=initialize()
    problems_orig,stats_orig=getData()
    print ("Total problems present :"+str(len(problems_orig)))
    print ("Total problem stats :"+str(len(stats_orig)))


    focus_problems,problem_count=modify(problems_orig,stats_orig,ROUND)
    sorted_list=sortProblems(focus_problems)
    problems=filterProblems(sorted_list,lower_bound,upper_bound)
    
    solved_count,solved_check=get_solved(users)
    print("Number of problems solved is "+str(solved_count))
    print("Final list length: "+str(len(problems)))

    remaining_problems=save_list(problems,solved_check)
    print("Problems solved in this category : " + str(len(problems) - remaining_problems))
    print("Remaining problems to solve in list:"+str(remaining_problems))
