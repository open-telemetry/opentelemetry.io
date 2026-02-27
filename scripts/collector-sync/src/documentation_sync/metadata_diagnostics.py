"""Diagnostics for tracking metadata quality issues during documentation sync."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ComponentIssue:
    """Represents a metadata issue for a specific component."""

    name: str
    component_type: str
    source_repo: str
    issue_type: str
    details: str


@dataclass
class MetadataDiagnostics:
    """Tracks metadata quality issues during documentation generation."""

    issues: list[ComponentIssue] = field(default_factory=list)

    def record_missing_metadata(self, component: dict[str, Any], component_type: str) -> None:
        """Record a component that's completely missing metadata field."""
        self.issues.append(
            ComponentIssue(
                name=component.get("name", "unknown"),
                component_type=component_type,
                source_repo=component.get("source_repo", "unknown"),
                issue_type="missing_metadata",
                details="Component has no metadata field",
            )
        )

    def record_missing_status(self, component: dict[str, Any], component_type: str) -> None:
        """Record a component that's missing status field in metadata."""
        self.issues.append(
            ComponentIssue(
                name=component.get("name", "unknown"),
                component_type=component_type,
                source_repo=component.get("source_repo", "unknown"),
                issue_type="missing_status",
                details="Component metadata has no status field",
            )
        )

    def record_missing_stability(self, component: dict[str, Any], component_type: str) -> None:
        """Record a component that's missing stability field in status."""
        self.issues.append(
            ComponentIssue(
                name=component.get("name", "unknown"),
                component_type=component_type,
                source_repo=component.get("source_repo", "unknown"),
                issue_type="missing_stability",
                details="Component status has no stability field",
            )
        )

    def has_issues(self) -> bool:
        """Check if any issues were recorded."""
        return len(self.issues) > 0

    def get_issue_count(self) -> int:
        """Get total number of issues."""
        return len(self.issues)

    def get_issues_by_type(self) -> dict[str, list[ComponentIssue]]:
        """Group issues by issue type."""
        grouped: dict[str, list[ComponentIssue]] = {}
        for issue in self.issues:
            if issue.issue_type not in grouped:
                grouped[issue.issue_type] = []
            grouped[issue.issue_type].append(issue)
        return grouped

    def get_issues_by_component_type(self) -> dict[str, list[ComponentIssue]]:
        """Group issues by component type (receiver, processor, etc.)."""
        grouped: dict[str, list[ComponentIssue]] = {}
        for issue in self.issues:
            if issue.component_type not in grouped:
                grouped[issue.component_type] = []
            grouped[issue.component_type].append(issue)
        return grouped

    def generate_summary(self) -> str:
        """
        Generate a human-readable summary of all issues.

        Returns:
            Multi-line string suitable for logging or issue creation
        """
        if not self.has_issues():
            return "✅ No metadata issues found - all components have complete metadata"

        lines = [f"⚠️  Found {self.get_issue_count()} metadata issue(s)\n"]

        by_type = self.get_issues_by_type()
        lines.append("## Issues by Type\n")
        for issue_type, issues in sorted(by_type.items()):
            lines.append(f"### {issue_type.replace('_', ' ').title()} ({len(issues)})\n")
            for issue in sorted(issues, key=lambda i: (i.component_type, i.name)):
                lines.append(f"- **{issue.component_type}/{issue.name}** ({issue.source_repo}): {issue.details}")
            lines.append("")

        return "\n".join(lines)

    def generate_github_issue_body(self) -> str:
        """
        Generate a GitHub issue body with detailed metadata issues.

        Returns:
            Markdown-formatted string suitable for GitHub issue creation
        """
        if not self.has_issues():
            return ""

        lines = []
        lines.append("## Summary\n")
        lines.append(
            f"The documentation sync process found **{self.get_issue_count()} components** "
            "with missing or incomplete metadata. These components will display incomplete "
            "information in the documentation tables (showing `-` or `N/A`).\n"
        )

        # Breakdown by issue type
        by_type = self.get_issues_by_type()
        lines.append("## Issue Breakdown\n")
        for issue_type, issues in sorted(by_type.items()):
            lines.append(f"- **{issue_type.replace('_', ' ').title()}**: {len(issues)} components")
        lines.append("")

        # Detailed list by component type
        by_comp_type = self.get_issues_by_component_type()
        lines.append("## Affected Components\n")

        for comp_type, issues in sorted(by_comp_type.items()):
            lines.append(f"### {comp_type.capitalize()} ({len(issues)} issues)\n")
            lines.append("| Component | Source | Issue | Details |")
            lines.append("|-----------|--------|-------|---------|")
            for issue in sorted(issues, key=lambda i: i.name):
                lines.append(f"| `{issue.name}` | {issue.source_repo} | {issue.issue_type} | {issue.details} |")
            lines.append("")

        lines.append("## Action Required\n")
        lines.append("Please review the affected components and ensure their metadata files include:")
        lines.append("1. `metadata` field")
        lines.append("2. `metadata.status` field")
        lines.append("3. `metadata.status.stability` field with appropriate signal levels")
        lines.append("")
        lines.append("---")
        lines.append("*This issue was automatically generated by the documentation sync process.*")

        return "\n".join(lines)
