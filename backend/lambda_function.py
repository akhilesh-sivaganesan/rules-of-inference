import copy
import random
import string
import re

def lambda_handler(event, context):
    
    # The basic rules of inference with numbers as placeholders for letters
    RULES = {   
    "Modus Ponens" : {
        "premises": [[1], [1, "→", 2]],
        "conclusion": [2]
    },
    "Modus Tollens" : {
        "premises": [["¬", 4], [1,"→", 4]],
        "conclusion": ["¬", 1]
    },
    "Hypothetical Syllogism" : {
        "premises": [[1,"→",2], [2,"→",3]],
        "conclusion": [1,"→",3]
    },
    "Disjunctive Syllogism" : {
        "premises": [["¬",3], [3," ∨ ",4]],
        "conclusion": [4]
    },
    "Addition" : {
        "premises": [[1]],
        "conclusion": [1," ∨ ",2]
    },
    "Simplification" : {
        "premises": [[1," ∧ ",2]],
        "conclusion": [1]
    },
    "Conjunction" : {
        "premises": [[1],[2]],
        "conclusion": [1," ∧ ",2]
    },
    "Resolution" : {
        "premises": [[1," ∨ ",2], ["¬",1," ∨ ",3]],
        "conclusion": [2," ∨ ",3]
    },
    }
    

    # Returns a random rule
    def getRule():
        randRule = random.choice(list(RULES.keys()))
        randomRule = copy.deepcopy(RULES[randRule])
        return randomRule, randRule
    

    # Reruns the algorithm. Called when giving two rules that shouldn't be added together.
    def redo():
        rule1, name1 = getRule()
        rule2, name2 = getRule()
        return addRules(rule1, rule2, name1, name2) 
    

    #Counts the variables in a list of lists and returns the count and the variables.
    def countVars(lines):
        count=0
        vars = []
        for line in lines:
            for symbol in line:
                if isinstance(symbol, int) and symbol not in vars:
                    vars.append(symbol)
                    count+=1
        return count, vars


    # Negate a random variable throughout the rule{premises, conclusion}. Negates variable if its passed in
    def negateRandom(rule, variable):
        #Get list of variables
        count,vars = countVars(rule['premises'])

        #If variable is not passed in pick one
        if not variable:
            variable = vars[random.randint(0,count-1)]
        print("Variable: ", variable)

        #Check each premise line for the variable. 
        for line in range(len(rule['premises'])):
            index = 0
            while index < len(rule['premises'][line]):
                if rule['premises'][line][index] == variable:
                    if index == 0 or rule['premises'][line][index-1] != "¬":
                        rule['premises'][line].insert(max(0,index), "¬")
                        index+=1
                    else:
                        if rule['premises'][line][index-1] == "¬":
                            rule['premises'][line].pop(index-1)
                index+=1
       
        #Check conclusion for variable (same as code for premises)
        symbol = 0
        while symbol < (len(rule['conclusion'])):
            if rule['conclusion'][symbol] == variable:
                if symbol == 0 or rule['conclusion'][symbol-1] != "¬":
                    rule['conclusion'].insert(max(0,symbol), "¬")
                    symbol+=1
                else:
                    if rule['conclusion'][symbol-1] == "¬":
                        rule['conclusion'].pop(symbol-1)
            symbol+=1
        print("Negated Rule: ", rule)
        return rule
    

    #Returns the "equation type": if its an and, or, implies etc
    def findEquationType(rule):
        for x in range(1, len(rule)):
            if rule[0:x].count("(") == rule[0:x].count(")"):
                if rule[x] == " ∨ ":
                    return(" ∨ "),x
                if rule[x] == " ∧ ":
                    return(" ∧ "),x
                if rule[x] == "→":
                    return ("→"),x
        return("NA"),None


    #Replace the 'replace' in the lines with 'replaceWith' and multiply var numbers when necessary to avoid overlap.
    def replacePremises(lines, replaceArray, replaceWithArray, checkVars):
        for lineNum in range(len(lines)):
            index = 0
            while index < (len(lines[lineNum])):
                for replace in range(len(replaceArray)):
                    if lines[lineNum][index:index+len(replaceArray[replace])] == replaceArray[replace]:
                        for x in range(len(replaceArray[replace])):
                            del lines[lineNum][index]
                        if len(replaceWithArray[replace]) > 2:
                            lines[lineNum].insert(index, ")")
                        for x in range(len(replaceWithArray[replace])):
                            lines[lineNum].insert(index-x, replaceWithArray[replace][-1-x])
                            index+=1
                        if len(replaceWithArray[replace]) > 2:
                            lines[lineNum].insert(index-len(replaceWithArray[replace]), "(")
                            index += 2
                        # index-=1
                if index < len(lines[lineNum]) and lines[lineNum][index] in checkVars:
                    lines[lineNum][index] = lines[lineNum][index] * 10
                index +=1
        return lines        

    # Adds two rules together
    def addRules(rule1, rule2, rule1Name, rule2Name):
        print(rule1)
        print(rule2)
        count1, vars1 = countVars([rule1['conclusion']])
        count2, vars2 = countVars(rule2['premises'])
        rules = [rule1, rule2]
        ruleNames = [rule1Name, rule2Name]

        #A few rules that don't make sense when added together. Might need to add more?
        if (rule1Name == "Conjunction") or (rule1Name == "Addition" and rule2Name == "Disjunctive Syllogism"):
            return redo()

        #Determine the type of conclusion in order to decide how to combine the two rules.
        r1c, r1cMid = findEquationType(rule1['conclusion'])
        if " ∨ " == r1c:
            line = -1
            #Check if or also exists in rule2.
            for rule in rule2['premises']:
                conclusion, arrowIndex = findEquationType(rule)
                if conclusion == " ∨ ":
                    line = rule2['premises'].index(rule)
                    break    
            #If or exists in rule2 premise just replace rule1 conclusion with the premise  
            if line != -1:
                matchLine = rule2['premises'][line]
                vars2 = [var for var in vars2 if var not in rule1['conclusion']]
                rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][:r1cMid], rule1['conclusion'][r1cMid+1:]], [matchLine[:arrowIndex], matchLine[arrowIndex+1:]], vars2)
                rule1['conclusion'] = matchLine 
                     
                del rule2['premises'][line] 

            else:
                return(redo())

        elif "→" == r1c:
            #check if other rule has an implies as well
            line = -1
            for rule in rule2['premises']:
                conclusion, arrowIndex = findEquationType(rule)
                if conclusion == "→":
                    line = rule2['premises'].index(rule)
                    break

            #Rule 2 has an implies, so simply match up variables
            print(line)
            vars2 = [var for var in vars2 if var not in rule1['conclusion']]

            if line != -1:
                matchLine = rule2['premises'][line]
                rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][:r1cMid], rule1['conclusion'][r1cMid+1:]], [matchLine[:arrowIndex], matchLine[arrowIndex+1:]], vars2)

                del rule2['premises'][line]
                rule1['conclusion'] = matchLine
            else:
                #No premise with implies, so imply a full line in rule 2 premise 
                line = random.randrange(0,len(rule2['premises']))
                beforeAfter = random.randint(0, 1)
                print(line)
                rule3 = copy.deepcopy(rule2)
                if beforeAfter:
                    #Replace premises
                    count1, vars1 = countVars([rule1['conclusion'][:r1cMid]])
                    vars2 = [var for var in vars2 if var not in vars1]
                    array = rule2['premises'][line]
                    if array[0] == "¬":
                        array.pop(0)
                    else:
                        array.insert(0,"¬")
                    rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][:r1cMid]], [rule2['premises'][line]], vars2)
                    temp = rule2['premises'][line]
                    rule2['premises'] = [rule1['conclusion'][r1cMid+1:]]
                    rule2['premises'][0].insert(0, "¬")
                    ruleNames.insert(-1, "Modus Tollens")
                    
                    #Replace conclusion
                    for index in range(r1cMid):
                        del rule1['conclusion'][0]
                    if len(temp) > 2:
                        rule1['conclusion'].insert(0, ")")
                    for x in range(len(temp)):
                        rule1['conclusion'].insert(0, temp[-1-x])
                    if len(temp) > 2:
                        rule1['conclusion'].insert(0, "(")
                else:
                    #Replace premises
                    count1, vars1 = countVars([rule1['conclusion'][r1cMid+1:]])
                    vars2 = [var for var in vars2 if var not in vars1]
                    rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][r1cMid+1:]], [rule2['premises'][line]], vars2)
                    
                    
                    ruleNames.insert(-1, "Modus Ponens")
                    temp = [rule1['conclusion'][:r1cMid]]
                    #Replace conclusion
                    for index in range(r1cMid+1, len(rule1['conclusion'])):
                        del rule1['conclusion'][r1cMid+1]
                    if len(rule2['premises'][line]) > 2:
                        rule1['conclusion'].insert(r1cMid+1, ")")
                    for x in range(len(rule2['premises'][line])):
                        rule1['conclusion'].insert(r1cMid+1, rule2['premises'][line][-1-x])
                    if len(rule2['premises'][line]) > 2:
                        rule1['conclusion'].insert(r1cMid+1, "(")
                    rule2['premises'] = temp
                print("new rule: ", rule1)

                rule2['conclusion'] = rule3['premises'][line]
                
                del rule3['premises'][line]  
                
                rules.append(rule3) 
                
            print("EDITED: ", rule1)
            print(rule2)

            lineNum = line+1
        else:
            #Conclusion is just a variable(s)

            #Find premise without and/or
            premiseToReplace = -1
            lineNum = -1
            for line in rule2['premises']:
                if findEquationType(line) == ("NA", None):
                    premiseToReplace = line
                    lineNum = rule2['premises'].index(line)

            vars2 = [var for var in vars2 if var not in vars1]

            if premiseToReplace == -1 and lineNum == -1:
                lineNum = random.randrange(0,len(rule2['premises']))
                premiseToReplace = rule2['premises'][lineNum]
            if rule1['conclusion'][0] != "¬" or (rule1['conclusion'][0] == "¬" and rule2['premises'][lineNum][0] == "¬" and (rule2['premises'][lineNum][1] == "(" or len(rule2['premises'][lineNum]) == 2)):            
                if rule1['conclusion'][0] != "¬":
                    rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion']], [premiseToReplace], vars2)
                elif rule2['premises'][lineNum][0] == "¬":
                    rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][1:]], [premiseToReplace[1:]], vars2)
                else:
                    rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][1:]], [premiseToReplace], vars2)
                rule1['conclusion'] = rule2['premises'][lineNum]
                del rule2['premises'][lineNum]
            else:
                rule3 = copy.deepcopy(rule2)
                rule2 = copy.deepcopy(RULES['Disjunctive Syllogism'])
                rule2['conclusion'] = premiseToReplace
                # lineNum = 0
                premiseToReplace2 = rule2['premises'][0]
                count2, vars2 = countVars(rule2['premises'])
                vars2 = [var for var in vars2 if var not in vars1 and var not in rule2['premises'][lineNum]]
                rule1['premises'] = replacePremises(rule1['premises'], [rule1['conclusion'][1:]], [premiseToReplace2[1:]], vars2)
                print(premiseToReplace2)
                rule1['conclusion'] = replacePremises([rule1['conclusion']], [rule1['conclusion']], [premiseToReplace2], [])[0]
                del rule3['premises'][lineNum]
                del rule2["premises"][0]
                rule2['premises'][0] = replacePremises([rule2['premises'][0]], [[rule2['premises'][0][0]], [rule2['premises'][0][-1]]], [premiseToReplace, premiseToReplace2[1:]], [])[0]
                rules = [rule1, rule2, rule3]
                ruleNames = [rule1Name, 'Disjunctive Syllogism', rule2Name]

                
            print("EDITED", rule1)
            
            print("VARIABLE CHOSEN = ", premiseToReplace)
        print("UPDATED RULES: ", rules)

        premises = []
        solution = []
        conclusion = []
        letters = {}
        index = 0

        #Convert rules into the solutions with letters and combine into one.
        for index in range(len(rules)):
            premisesConverted, solutionConverted, conclusionConverted, letters = symbolsToLetters(rules[index], letters, ruleNames[index])
            if index == 0:
                premises = premisesConverted
                solution = solutionConverted
            else:
                premises.extend(premisesConverted)
                for index2 in range(len(solutionConverted)):
                    solutionConverted[index2]['stepID']+=len(solution)
                    if "," in solutionConverted[index2]['evidence']:
                        lines = solutionConverted[index2]['evidence'].split(",")
                        lines[0] = int(lines[0]) + len(solution)
                        lines[1] = int(lines[1]) + len(solution)
                        solutionConverted[index2]['evidence'] = ",".join(str(line) for line in lines)
                    elif solutionConverted[index2]['evidence'] != '':
                        solutionConverted[index2]['evidence'] = int(solutionConverted[index2]['evidence'])+len(solution)

                solution.extend(solutionConverted)
                print("NEW SOLUTION: ", solution)
            if index == len(rules)-1:
                conclusion = conclusionConverted
        return premises, solution, conclusion, letters


    # Takes the lines and replaces the numbers with the letters
    def symbolsToLetters(rule, dict, ruleName):
        print(dict)
        letters = {} if not dict else dict
        premises = []
        solution = []
        for premise in rule['premises']:
            line = ""
            for symbol in premise:
                if isinstance(symbol, int):
                    if symbol not in letters:
                        randomLetter = ""
                        while randomLetter == "" or randomLetter in list(letters.values()):
                            randomLetter = random.choice(string.ascii_letters.lower())
                        letters[symbol] = randomLetter
                    line+=letters[symbol]
                else:
                    line+=symbol
            premises.append(line)

            #Turns the premises and steps into strings for front end purposes.
            solution.append({"stepID": len(solution), 
                            "statement": line,
                            "justification": "Premise",
                            "evidence": ""})
        line = ""
        for symbol in rule['conclusion']:
            if isinstance(symbol, int):
                if symbol not in letters:
                    randomLetter = ""
                    while randomLetter == "" or randomLetter in list(letters.values()):
                        randomLetter = random.choice(string.ascii_letters.lower())
                    letters[symbol] = randomLetter
                line+=letters[symbol]
            else:
                line+=symbol
        print(len(RULES[ruleName]['premises']))
        if len(RULES[ruleName]['premises']) == 2 and len(rule['premises']) == 2:
            solution.append({"stepID": len(solution), 
                                "statement": line,
                                "justification": ruleName,
                                "evidence": "1,2"})
        elif len(RULES[ruleName]['premises']) == 2 and len(rule['premises']) == 1:
            solution.append({"stepID": len(solution), 
                                "statement": line,
                                "justification": ruleName,
                                "evidence": "0,1"})
        elif len(RULES[ruleName]['premises']) == 1:
            solution.append({"stepID": len(solution), 
                                "statement": line,
                                "justification": ruleName,
                                "evidence": "1"})
        else:
            solution.append({"stepID": len(solution), 
                                "statement": line,
                                "justification": ruleName,
                                "evidence": "1"})
        print("PREMISES: ", premises)
        print("SOLUTION: ", solution)
        print(letters)
        return premises, solution, line, letters
    
    def demorgans_law(expression):
        # if we have a list of characters, convert to string first
        if isinstance(expression, list):
            expression = ''.join(expression)
        expression = ''.join(expression.split()) # remove all whitespace
        single = re.compile(r'¬?[a-z]')
        if single.fullmatch(expression):
            return expression, "N/A"
        symbolCount = 0
        index = 0
        negate_out = True
        type = "Pull Negation"
        equivalent = []
        # pull out a negation from expression or distribute one
        if expression[0:2] == "¬(" and expression[-1] == ")":
            negate_out = False
            type = "Push Negation"
            expression = create_groups(expression[2:len(expression) - 1])
        elif expression[0] == "(" and expression[-1] == ")":
            expression = create_groups(expression[1:len(expression) - 1])
        else:
            expression = create_groups(expression)
        if "→" in expression:
            equivalent = conditional_disjunction(expression)
            return ''.join(equivalent), "Conditional Disjunction"
        while index < len(expression):
            print(expression)
            print("EQ", equivalent)
            # check to see if current index is a portion of expression in nested parentheses or a single character already negated
            if len(expression[index]) >= 2 and (expression[index] != " ∨ " and expression[index] !=" ∧ " ):
                if expression[index][0] == "¬":
                    equivalent.append(expression[index][1:])
                else:
                    equivalent.append("¬" + expression[index])
                symbolCount += 1
            # check if current index is a single letter, negate if so
            elif expression[index].islower():
                equivalent.append(f"¬{expression[index]}")
                symbolCount += 1
            # check if we are already negating, then un negate and skip an index
            elif expression[index] == "¬":
                equivalent.append(expression[index + 1])
                index += 1
                symbolCount += 1
            # flip operations
            elif expression[index] == "∨" or expression[index] == " ∨ ":
                equivalent.append(" ∧ ")
            elif expression[index] == "∧" or expression[index] == " ∧ ":
                equivalent.append(" ∨ ")
            # append to equivalent list
            else:
                equivalent.append(expression[index])
            index += 1
            
        if negate_out and symbolCount > 1:
            equivalent.insert(0, "¬(")
            equivalent.append(")")
        # elif not negate_out:
        #     equivalent.remove(")")
        return ''.join(equivalent), type
    
    # split expression into a list of characters; exception is for inner parentheses, leave those as a string
    # assumes only one layer of nested parentheses
    def create_groups(expression):
        stack = []
        currTerm = ""
        groups = []
        for c in expression:
            if c == '(':
                stack.append(c)
                currTerm = "("
            elif c == ')':
                stack.pop()
                currTerm += ')'
                groups.append(currTerm)
            elif len(stack) > 0:
                currTerm += c
            else:
                groups.append(c)
        print("groups", groups)

        return groups

    def conditional_disjunction(expression):
        if expression[0] == "¬":
            expression = expression[1:]
        elif len(expression[0]) > 1 and expression[0][0] == "¬":
            expression = expression[0][1:]
        else:
            expression = ["¬"] + expression
        index = expression.index("→")
        expression[index] = " ∨ "
        return expression

    

    #easy problem generation
    if event['difficulty'] == "easy":
        randomRule, randRule = getRule()  

        print(randomRule)
        if random.random() > 0.8 and randRule != 'Modus Ponens' and randRule != 'Modus Tollens':
            randomRule = negateRandom(randomRule, None)
        # if random.random() > 0.8:
        #     print("Before Demorgans", randomRule)
        #     randomRule['premises'][0] = demorgans_law(''.join(str(line) for line in randomRule['premises'][0]))
        #     print("After Demorgans", randomRule)
        # randomRule = negateRandom(randomRule, None)
        print(randomRule)
        premises, solution, conclusion, letters = symbolsToLetters(randomRule, None, randRule)
        


    # medium problem generation
    if event['difficulty'] == "medium":
        randomRule, randRule = getRule()
        randomRule2, randRule2 = getRule()

        if random.random() > 0.6 and randRule != 'Modus Ponens' and randRule != 'Modus Tollens':
            randomRule = negateRandom(randomRule, None)
        if random.random() > 0.6 and randRule != 'Modus Ponens' and randRule != 'Modus Tollens':
            randomRule2 = negateRandom(randomRule2, None)
        premises, solution, conclusion, letters = addRules(randomRule, randomRule2, randRule, randRule2) 
        if random.random() > 0.75:
            newConclusion, rule = demorgans_law(conclusion)
            if newConclusion != conclusion:
                print("NEW")
                solution.append({'stepID': len(solution), 'statement': newConclusion, 'justification': rule, 'evidence': len(solution)-1})
                conclusion = newConclusion
        if random.random() > 0.75:
            newPremise, rule = demorgans_law(premises[0])
            if newPremise != premises[0]:
                print("NEW PREMISE")
                solution.insert(1, {'stepID': 0, 'statement': premises[0], 'justification': rule, 'evidence': 0})
                solution[0]['statement'] = newPremise
                for x in range(1,len(solution)-1):
                    solution[x]['stepID'] = solution[x]['stepID'] + 1
                premises[0] = newPremise
        # print("Demorgans", demorgans_law("(a ∨ c)"))

    
    problem = [{
            "premises": premises,
            "conclusion": conclusion,
            "solution": solution,
            "letters": letters,
            "problemName": event['difficulty']
    }]
    
    return {
        'statusCode': 200,
        'body': problem
    }

print(lambda_handler({'difficulty':'medium'}, None))

