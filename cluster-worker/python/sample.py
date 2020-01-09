import sys
import time

def input_loop():
    while True:
        value = input()
        time.sleep(1)
        print(value)

if __name__ == '__main__':
    time.sleep(1)

    print('INITIALIZED')

    input_loop()
