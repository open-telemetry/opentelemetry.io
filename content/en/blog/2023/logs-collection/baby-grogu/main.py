"""
The Baby Grogu 'Train The Telemetry' version.
"""

import random
import sys
import string
import time

# Practice The Telemetry
def practice(how_long):
    """
    This is the practice "The Telemetry" function.

    Args:
        how_long (int): Defines how to long to practice (in seconds).

    Returns:
        bool: True for successfully completed practice, False otherwise.
    """
    start_time = time.time()
    try:
        how_long_int = int(how_long)
        print(f"Starting to practice The Telemetry for {how_long_int} second(s)")
        while time.time() - start_time < how_long_int:
            next_char = random.choice(string.punctuation)
            print(next_char, end="", flush=True)
            time.sleep(0.5)
        print("\nDone practicing")
    except ValueError as ve:
        print(f"I need an integer value for the time to practice: {ve}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False
    return True

# Main function
def main():
    """
    The main function of the Python program.
    """
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} TIME_TO_PRACTICE_IN_SECONDS")
        sys.exit(1)
    result = practice(sys.argv[1])
    print(f"Practicing The Telemetry completed: {result}")

# Standard boilerplate calling main() function
if __name__ == "__main__":
    main()
