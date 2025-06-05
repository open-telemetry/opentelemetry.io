---
title: Troubleshooting
weight: 80
---

## ConverterNotFoundException

Error:

```text
org.springframework.core.convert.ConverterNotFoundException: No converter found capable of converting from type [java.lang.String] to type [java.util.Map<java.lang.String, java.lang.String>]
```

This is caused ty application has replaced the default converter registry as follows - or similar:

```java
@Bean
public ConversionService conversionService() {
    return new DefaultFormattingConversionService();
}
```

To fix the issue, change it to:

```java
@Bean
public ConversionService conversionService() {
    DefaultFormattingConversionService service = new DefaultFormattingConversionService();
    service.addConverter(new OtelMapConverter());
    return service;
}
```


