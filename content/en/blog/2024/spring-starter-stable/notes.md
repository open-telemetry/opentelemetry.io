delete these notes before publishing


# Copilot

---
title: "The Evolution and Impact of the Spring Starter"
linkTitle: "Spring Starter Evolution"
date: 2024-04-01
author: "Your Name"
cSpell:ignore: "JAVA_OPTS, GraalVM"
---

# Introduction

The Spring Framework has long been celebrated for its comprehensive infrastructure support for developing Java applications. Among its many features, the Spring starter stands out as a pivotal component, streamlining the development process and enhancing productivity. This blog post delves into the significance of the Spring starter, the objectives for its general availability (GA), and the lessons learned throughout its development journey.

# Why is the Spring Starter Important?

Spring users have come to expect starters as a standard method for addressing various aspects of application development. Unlike other configurations, a Spring starter simplifies the setup process without the need for additional JVM options or Docker files. This ease of use and integration is what makes the Spring starter an essential tool in the Spring ecosystem.

# Goals for GA

As we approached the general availability of the Spring starter, several goals were set to ensure its success:

- **Uniform Configuration**: Facilitating easy transitions between agent-based and starter-based configurations.
- **Compatibility**: Ensuring that all properties configured in the agent remain effective.
- **Extension Simplicity**: Allowing extensions to be easily integrated as Spring Beans.
- **Test Coverage**: Achieving comprehensive test coverage for supported Spring Boot versions.
- **GraalVM Support**: Ensuring full functionality with GraalVM native compilation.
- **First-Class Documentation**: Prioritizing thorough and accessible documentation.
- **User Feedback**: Incorporating feedback from users to refine and improve the starter.

# Non-Goals

It was also important to recognize the limitations and set clear non-goals:

- Matching the agent's number of instrumentations was deemed unrealistic due to the vast scope.
- Replicating all functionalities achievable through bytecode manipulation by the agent was not targeted.

# What did we learn along the way?

- The development process took much longer than expected, highlighting the complexity of integrating a new starter into the Spring ecosystem.
- Reusing the agent configuration classes was more challenging than anticipated, necessitating the creation of new APIs in both the SDK and instrumentation layers. This was a significant learning curve but ultimately led to a more flexible and powerful configuration system.
- Feedback from early adopters was invaluable. It helped us identify and fix several issues early on, ensuring a more stable and user-friendly release.
- The importance of thorough documentation became evident. As we developed the starter, we realized that clear, comprehensive documentation is crucial for adoption and effective use of the new feature.
- Testing across different versions of Spring Boot was more complex than initially thought. It required a comprehensive testing strategy to ensure compatibility and performance across the board.
- The limitations of what can be achieved without bytecode manipulation were clearer. While the starter provides a significant portion of the functionality available through the agent, there are inherent limitations to what can be done at runtime without modifying the bytecode.
- The process underscored the importance of community involvement. Contributions from the community not only helped improve the starter but also fostered a sense of ownership and investment in the project's success.

Overall, the journey to GA for the Spring starter was a learning experience that underscored the importance of community feedback, thorough testing, and clear documentation. It has set a strong foundation for future developments and improvements.

# Notes

# Why is the Spring starter important?

- Spring user expect to have a starter as this is the way all other aspects are addressed
- A Spring starter does not require the addition of a JVM option to enable it (with JAVA_OPTS or a Docker file for example)

# What goals did we have for GA?

- uniform configuration to make it easy to move from agent and back
- All properties that users have configured it the agent should continue to work
- Extensions should simply be a Spring Bean
- Have test coverage for supported Boot versions
- Make sure that all features work with GraalVM native
- Documentation is a first class citizen
- Have feedback from users (e.g. bug reports)
- what does stable mean?

# What are non-goals?

- Have the same number of instrumentations
- It’s a very large number 
- You can’t do everything that the agent can do with bytecode manipulation

# What did we learn along the way?

- took much longer than expected
- reusing the agent configuration classes requires some new APIs both is SDK and instrumentation
- what we learned for file configuration

## What does it mean to be stable?

- library itself is stable
  - no breaking changes in the API (except for internal APIs)
    - only io.opentelemetry.instrumentation.spring.autoconfigure.OpenTelemetryAutoConfiguration right now so you can use it for ordering 
  - may still depend on unstable libraries
    - because of semantic conventions 
    - and internal APIs
- configuration is stable
  - no breaking changes in the configuration
  - no breaking changes in the properties
  - no breaking changes in the defaults
