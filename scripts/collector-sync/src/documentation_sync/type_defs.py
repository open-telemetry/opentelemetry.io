"""Shared type definitions for collector-watcher.

This module contains common type aliases used across the codebase.

VENDORED from opentelemetry-ecosystem-explorer/ecosystem-automation/collector-watcher
"""

from typing import Literal

DistributionName = Literal["core", "contrib"]

COMPONENT_TYPES = ["connector", "exporter", "extension", "processor", "receiver"]
