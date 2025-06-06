---
title: Troubleshooting
weight: 80
---

## ConverterNotFoundException

Error:

```text
org.springframework.core.convert.ConverterNotFoundException: No converter found capable of converting from type [java.lang.String] to type [java.util.Map<java.lang.String, java.lang.String>]
```

This error is caused when the application replaces the default converter
registry. For example:

```java
@Bean
public ConversionService conversionService() {
    return new DefaultFormattingConversionService();
}
```

To fix the issue, change the converter registry to:

```java
@Bean
public ConversionService conversionService() {
    DefaultFormattingConversionService service = new DefaultFormattingConversionService();
    service.addConverter(new OtelMapConverter());
    return service;
}
```
