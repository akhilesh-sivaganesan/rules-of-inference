import re
import json
def find_unique_alphabet_letters(premises):
    unique_letters = set()

    for premise in premises:
        letters = re.findall(r'[A-Za-z]+', premise)
        for letter in letters:
            unique_letters.add(letter)

    return unique_letters


def find_x_non_unique_letters(premises, x):
    unique_letters = find_unique_alphabet_letters(premises)
    non_unique_letters = []
    letter_ord = ord('A')

    while len(non_unique_letters) < x:
        if chr(letter_ord) not in unique_letters:
            non_unique_letters.append(chr(letter_ord))
        letter_ord += 1

    return non_unique_letters

def toggle_negation(expression):
    if expression.startswith("¬"):
        return expression[1:] if len(expression) == 2 else expression[2:-1]
    else:
        return "¬" + expression if len(expression) == 1 else "¬(" + expression + ")"
    
def modus_tollens(premise_to_replace, var2):
    var1 = toggle_negation(premise_to_replace)
    return {
        "premise1": toggle_negation(var2),
        "premise2": f"{var1}→{var2}",
        "conclusion": premise_to_replace
    }


def modus_ponens(premise_to_replace, var2):
    return {
        "premise1": var2,
        "premise2": f"{var2}→{premise_to_replace}",
        "conclusion": premise_to_replace
    }


def disjunctive_syllogism(premise_to_replace, var2):
    return {
        "premise1": f"{var2}∨{premise_to_replace}",
        "premise2": toggle_negation(var2),
        "conclusion": premise_to_replace
    }

def use_given_rule(premises, premise_to_replace, rule_func, justification):
    non_unique_letters = find_x_non_unique_letters(premises, 1)
    var2 = non_unique_letters[0]
    filled_rule = rule_func(premise_to_replace, var2)
    index_to_replace = next(i for i, step in enumerate(solution) if step['statement'] == premise_to_replace)

    del solution[index_to_replace]
    solution.insert(index_to_replace, {
        "stepID": index_to_replace,
        "statement": filled_rule['premise1'],
        "justification": "Premise",
        "evidence": ""
    })
    solution.insert(index_to_replace + 1, {
        "stepID": index_to_replace + 1,
        "statement": filled_rule['premise2'],
        "justification": "Premise",
        "evidence": ""
    })
    solution.insert(index_to_replace + 2, {
        "stepID": index_to_replace + 2,
        "statement": premise_to_replace,
        "justification": justification,
        "evidence": f"{index_to_replace + 1}, {index_to_replace + 2}"
    })

    for i in range(index_to_replace + 3, len(solution)):
        solution[i]['stepID'] = i
        if solution[i]['evidence']:
            numbers = list(map(int, solution[i]['evidence'].split(',')))
            updated_numbers = [(number + 2 if number >= index_to_replace + 1 else number) for number in numbers]
            solution[i]['evidence'] = ','.join(map(str, updated_numbers))

    premises.remove(premise_to_replace)
    premises.append(filled_rule['premise1'])
    premises.append(filled_rule['premise2'])
    return premises

def use_modus_tollens(premises, premise_to_replace, solution):
    return use_given_rule(premises, premise_to_replace, modus_tollens, "Modus Tollens")


def use_modus_ponens(premises, premise_to_replace):
    return use_given_rule(premises, premise_to_replace, modus_ponens, "Modus Ponens")


def use_disjunctive_syllogism(premises, premise_to_replace):
    return use_given_rule(premises, premise_to_replace, disjunctive_syllogism, "Disjunctive Syllogism")

def pretty_print_solution(solutions):
    print("-------------------------------------------------")
    for step in solutions:
        print(f"Step {step['stepID']}:", step['statement'])
        print("  Justification:", step['justification'])
        if step['evidence']:
            print("  Evidence:", step['evidence'])
    print("-------------------------------------------------")

# Example usage
premises = ["P", "P→Q"]
conclusion = "Q"
solution = [
    {"stepID": 0, "statement": 'P', "justification": 'Premise', "evidence": ''},
    {"stepID": 1, "statement": 'P→Q', "justification": 'Premise', "evidence": ''},
    {"stepID": 2, "statement": 'Q', "justification": 'Modus Ponens', "evidence": '1,2'}
]

print("Original Premises")
print(premises)
pretty_print_solution(solution)

premises = use_modus_tollens(premises, premises[0], solution)
print("\nModus Tollens Premises")
print(premises)
pretty_print_solution(solution)

premises = use_modus_ponens(premises, premises[0])
print("\nModus Ponens Premises")
print(premises)
pretty_print_solution(solution)

premises = use_disjunctive_syllogism(premises, premises[0])
print("\nDisjunctive Syllogism Premises")
print(premises)
pretty_print_solution(solution)
