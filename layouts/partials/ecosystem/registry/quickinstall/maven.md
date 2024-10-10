Add the following dependency in your `pom.xml` file to install this package.

{{% tabpane text=true right=true %}}
    {{% tab header="Maven" %}}
    ```xml
    <dependency>
        <groupId>{{ index (split .name "/") 0 }}</groupId>
        <artifactId>{{ index (split .name "/") 1 }}</artifactId>
        <version>{{ .version }}</version>
    </dependency>
    ```
    {{% /tab %}}
{{% /tabpane %}}
