"""
The Expert Grogu 'Train The Telemetry' version.
"""
import logging
import random
import sys
import string
import time
from pythonjsonlogger import jsonlogger

# Set up a logger
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# Create file handler and JSON formatter
log_fh = logging.FileHandler('exgru.log')
log_fh.setLevel(logging.DEBUG)
formatter = jsonlogger.JsonFormatter(
    fmt='%(asctime)s %(levelname)s %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S'
)
log_fh.setFormatter(formatter)

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
        logger.info("Starting to practice The Telemetry for %i second(s)", how_long_int)
        while time.time() - start_time < how_long_int:
            next_char = random.choice(string.punctuation)
            print(next_char, end="", flush=True)
            time.sleep(0.5)
        logger.info("Done practicing")
    except ValueError as ve:
        logger.error("I need an integer value for the time to practice: %s", ve)
        return False
    except Exception as e:
        logger.error("An unexpected error occurred: %s", e)
        return False
    return True

# Main function
def main():
    """
    The main function of the Python program.
    """
    # Attach OTLP handler to root logger
    logger.addHandler(log_fh)

    if len(sys.argv) < 2:
        logger.info("Usage: python %s TIME_TO_PRACTICE_IN_SECONDS", sys.argv[0])
        sys.exit(1)
    result = practice(sys.argv[1])
    logger.info("Practicing The Telemetry completed: %s", result)

# Standard boilerplate calling main() function
if __name__ == "__main__":
    main()
