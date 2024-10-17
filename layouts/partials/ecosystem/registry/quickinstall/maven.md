### Maven

Add the following dependency in your `pom.xml` file to install this package.

```xml
<dependency>
    <groupId>{{ index (split .name "/") 0 }}</groupId>
    <artifactId>{{ index (split .name "/") 1 }}</artifactId>
    <version>{{ .version }}</version>
</dependency>
```

### Gradle
Add the following dependency in your `build.gradle` file to install this package:

```groovy
implementation group: 'io.opentelemetry.instrumentation', name: 'opentelemetry-okhttp-3.0', version: '2.8.0-alpha'
```

**Gradle(short)**:
Add the following dependency in your `build.gradle` file:

```groovy
dependencies {
 implementation 'io.opentelemetry.instrumentation:opentelemetry-okhttp-3.0:2.8.0-alpha'
}
```

**Gradle(kotlin)**:
Add the following dependency in your `build.gradle.kts` file:

```kotlin
dependencies {
 implementation("io.opentelemetry.instrumentation:opentelemetry-okhttp-3.0:2.8.0-alpha")
}
```
    
