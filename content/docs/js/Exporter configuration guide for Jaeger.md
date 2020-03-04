---


---

<h1 id="exporter-configuration-guide-for-jaeger">Exporter configuration guide for Jaeger</h1>
<h3 id="installing-jaeger-locally">Installing Jaeger locally</h3>
<p>Download the Jaeger components: <a href="https://www.jaegertracing.io/download/">https://www.jaegertracing.io/download/</a>(Downloading the docker images should be the better option, (macOS binary wasn’t available (link is broken) when this document was being written))<br>
Commands for installing the docker image:</p>
<pre class=" language-docker"><code class="prism  language-docker">$ docker pull jaegertracing/all<span class="token punctuation">-</span>in<span class="token punctuation">-</span>one<span class="token punctuation">:</span>1.17
</code></pre>
<p>Then get Jaeger up and running : (<a href="https://www.jaegertracing.io/docs/1.17/getting-started/">https://www.jaegertracing.io/docs/1.17/getting-started/</a>)<br>
If you are using Docker, simply use this command:</p>
<pre class=" language-docker"><code class="prism  language-docker">$ docker run <span class="token punctuation">-</span>d <span class="token punctuation">-</span><span class="token punctuation">-</span>name jaeger \
  <span class="token punctuation">-</span>e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
  <span class="token punctuation">-</span>p 5775<span class="token punctuation">:</span>5775/udp \
  <span class="token punctuation">-</span>p 6831<span class="token punctuation">:</span>6831/udp \
  <span class="token punctuation">-</span>p 6832<span class="token punctuation">:</span>6832/udp \
  <span class="token punctuation">-</span>p 5778<span class="token punctuation">:</span>5778 \
  <span class="token punctuation">-</span>p 16686<span class="token punctuation">:</span>16686 \
  <span class="token punctuation">-</span>p 14268<span class="token punctuation">:</span>14268 \
  <span class="token punctuation">-</span>p 14250<span class="token punctuation">:</span>14250 \
  <span class="token punctuation">-</span>p 9411<span class="token punctuation">:</span>9411 \
  jaegertracing/all<span class="token punctuation">-</span>in<span class="token punctuation">-</span>one<span class="token punctuation">:</span>1.17
</code></pre>
<p>This will start Jaeger. Go on to <a href="http://localhost:16686/">http://localhost:16686/</a> to access the Jaeger UI.</p>
<h3 id="exporting-traces-from-your-application-to-jaeger">Exporting traces from your application to Jaeger</h3>
<p>Import the Jaeger Exporter in your application</p>
<pre class=" language-typescript"><code class="prism  language-typescript"><span class="token keyword">const</span> <span class="token punctuation">{</span> JaegerExporter <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token keyword">require</span><span class="token punctuation">(</span><span class="token string">'@opentelemetry/exporter-jaeger'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<h4 id="declare-the-config-options">Declare the config options</h4>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token keyword">const</span>  options <span class="token operator">=</span> <span class="token punctuation">{</span>
  serviceName<span class="token punctuation">:</span> string<span class="token punctuation">,</span> <span class="token comment">//example:'basic-service'</span>
  tags<span class="token punctuation">:</span> <span class="token string">''</span><span class="token punctuation">,</span> <span class="token comment">//optional</span>
  host <span class="token punctuation">:</span> string<span class="token punctuation">,</span> <span class="token comment">//default:'localhost'</span>
  port <span class="token punctuation">:</span> number<span class="token punctuation">,</span> <span class="token comment">//default: 6832</span>
  maxPacketSize<span class="token punctuation">:</span> number<span class="token punctuation">,</span> <span class="token comment">// default: 65000</span>
  <span class="token comment">// Force a flush on shutdown </span>
  forceFlush<span class="token punctuation">:</span> boolean<span class="token punctuation">;</span> <span class="token comment">// default: true</span>
  <span class="token comment">//Time to wait for an onShutdown flush to finish before closing the sender</span>
  flushTimeout<span class="token punctuation">:</span> number<span class="token punctuation">,</span> <span class="token comment">// default: 2000</span>
  logger<span class="token punctuation">:</span> <span class="token punctuation">{</span>
    <span class="token string">'error'</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
      <span class="token string">'message'</span><span class="token punctuation">:</span> string<span class="token punctuation">,</span>
       <span class="token string">'args'</span><span class="token punctuation">:</span> any<span class="token punctuation">,</span>
     <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token string">'warn'</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
      <span class="token string">'message'</span><span class="token punctuation">:</span> string<span class="token punctuation">,</span>
       <span class="token string">'args'</span><span class="token punctuation">:</span> any<span class="token punctuation">,</span>
     <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token string">'info'</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
      <span class="token string">'message'</span><span class="token punctuation">:</span> string<span class="token punctuation">,</span>
       <span class="token string">'args'</span><span class="token punctuation">:</span> any<span class="token punctuation">,</span>
     <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token string">'debug'</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
      <span class="token string">'message'</span><span class="token punctuation">:</span> string<span class="token punctuation">,</span>
       <span class="token string">'args'</span><span class="token punctuation">:</span> any<span class="token punctuation">,</span>
     <span class="token punctuation">}</span><span class="token punctuation">,</span>
   <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">//default: {}</span>
 <span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre>
<h4 id="initialize-the-exporter">Initialize the exporter</h4>
<pre class=" language-javascript"><code class="prism  language-javascript">exporter <span class="token operator">=</span> <span class="token keyword">new</span>  <span class="token class-name">JaegerExporter</span><span class="token punctuation">(</span>options<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>

