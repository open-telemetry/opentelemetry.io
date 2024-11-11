##### Maven

Add the following dependency in your `pom.xml` file to install this package.

```xml
<dependency>
    <groupId>{{ index (split .name "/") 0 }}</groupId>
    <artifactId>{{ index (split .name "/") 1 }}</artifactId>
    <version>{{ .version }}</version>
</dependency>
```

##### Gradle

Add the following dependency in your `build.gradle` file to install this package:

```groovy
dependencies {
 implementation '{{ index (split .name "/") 0 }}:{{ index (split .name "/") 1 }}:{{ .version }}'
}
```