{{ $lang := .Get 0 -}} {{ $spanExporterInterfaceUrl := .Get 1 }}

## Exportadores personalizados {#custom-exporters} 

Por fim, também é possível escrever o seu próprio exportador. Para mais informações, consulte [SpanExporter Interface na documentação da API]({{ $spanExporterInterfaceUrl }}).

## Agrupamento de Trechos e Registros de Log {#batching-span-and-log-records}

O SDK do OpenTelemetry fornece um conjunto de processadores de Trechos e Registros de Log padrão, que permitem emitir Trechos um-a-um ("simples") ou em lotes. O uso de agrupamentos é recomendado, mas caso não deseje agrupar seus Trechos ou Registros de Log, é possível utilizar um processador simples da seguinte forma:

{{ .Inner }} 
