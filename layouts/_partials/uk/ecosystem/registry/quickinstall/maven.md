##### Maven

Щоб встановити цей пакунок, додайте наступну залежність до вашого файлу `pom.xml`.

```xml
<dependency>
    <groupId>{{ index (split .name "/") 0 }}</groupId>
    <artifactId>{{ index (split .name "/") 1 }}</artifactId>
    <version>{{ .version }}</version>
</dependency>
```

##### Gradle

Щоб встановити цей пакунок, додайте наступну залежність до вашого файлу `build.gradle`:

```groovy
dependencies {
 implementation '{{ index (split .name "/") 0 }}:{{ index (split .name "/") 1 }}:{{ .version }}'
}
```
