#!/usr/bin/env python3
import json
import csv
from collections import OrderedDict

# Example:
# test = '{"1":{"sec":"1","question":"1+1=?","choices":{"A":1,"B":2,"C":3,"D":4},"key":"B","explain":"1+1=2"},"2":{"sec":"1","question":"1+2=?","choices":{"A":1,"B":2,"C":3,"D":4},"key":"C","explain":"1+2=3"}}'

try:

    quiz_filename = 'quiz.csv'
    quiz_list = []
        
    with open(quiz_filename) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:           
            if line_count > 0:
                quiz = OrderedDict()
                quiz_all = OrderedDict()
                choice = OrderedDict()
                quiz_id = row[0].strip()
                quiz['sec'] = row[1].strip()
                quiz['question'] = row[2].strip()
                choice['A'] = row[3].strip()
                choice['B'] = row[4].strip()
                choice['C'] = row[5].strip()
                choice['D'] = row[6].strip()
                quiz['choices'] = choice 
                quiz['key'] = row[7].strip()
                quiz['explain'] = row[8].strip()
                quiz_all[str(quiz_id)] = quiz
                quiz_list.append(quiz_all)
            line_count += 1

    result = json.dumps(quiz_list, indent=4)
    print('result =',result)
    print()

    json_to_write = ','.join(json.dumps(i) for i in quiz_list)
    json_to_write = json_to_write.replace('}},{','},')  
    json_to_write = 'test_pool = \'' + json_to_write + '\''

    with open('test.json', 'w') as fp:
        print('saving...', json_to_write)    
        fp.write(json_to_write)

except FileNotFoundError:
    print('cannot find quiz.csv')



