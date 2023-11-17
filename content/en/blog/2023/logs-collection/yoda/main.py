"""
The Yoda 'Train The Telemetry' version.
"""
import logging
import os
import random
import sys
import string
import time

from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
#  from opentelemetry.sdk._logs.export import ConsoleLogExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource

logger_provider = LoggerProvider(
    resource=Resource.create(
        {
            "service.name": "train-the-telemetry",
            "service.instance.id": os.uname().nodename,
        }
    ),
)
set_logger_provider(logger_provider)

otlp_exporter = OTLPLogExporter(endpoint="http://collector:4317", insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(otlp_exporter))

#  console_exporter = ConsoleLogExporter()
#  logger_provider.add_log_record_processor(BatchLogRecordProcessor(console_exporter))

handler = LoggingHandler(level=logging.NOTSET, logger_provider=logger_provider)

# Practice The Telemetry
def practice(how_long):
    """
    This is the practice "The Telemetry" function.

    Args:
        how_long (int): Defines how to long to practice (in seconds).

    Returns:
        bool: True for successfully completed practice, False otherwise.
    """
    practice_logger = logging.getLogger("yoda.practice")
    practice_logger.setLevel(logging.INFO)
    start_time = time.time()
    try:
        how_long_int = int(how_long)
        practice_logger.info("Starting to practice The Telemetry for %i second(s)", how_long_int)
        while time.time() - start_time < how_long_int:
            next_char = random.choice(string.punctuation)
            print(next_char, end="", flush=True)
            time.sleep(0.5)
        practice_logger.info("Done practicing")
    except ValueError as ve:
        practice_logger.error("I need an integer value for the time to practice: %s", ve)
        return False
    except Exception as e:
        practice_logger.error("An unexpected error occurred: %s", e)
        return False
    return True

# Main function
def main():
    """
    The main function of the Python program.
    """
    # Attach OTLP handler to root logger
    logging.getLogger().addHandler(handler)
    main_logger = logging.getLogger("yoda.main")
    main_logger.setLevel(logging.INFO)
    if len(sys.argv) < 2:
        main_logger.error("Usage: python %s TIME_TO_PRACTICE_IN_SECONDS", sys.argv[0])
        sys.exit(1)
    result = practice(sys.argv[1])
    main_logger.info("Practicing The Telemetry completed: %s", result)
    logger_provider.shutdown()

# Standard boilerplate calling main() function
if __name__ == "__main__":
    main()
