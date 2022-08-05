<template>
  <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(20rem, 30rem)); column-gap: 5rem; align-items: flex-start;">
    <div>
      <h2 class="margin-block-row">Background Colors</h2>
      <div class="grid" style="grid-template-columns: 2rem auto auto auto; row-gap: 0.25rem;">
        <div style="height: 2rem; background: rgb(var(--color-zero));" />           <div>zero</div>           <div>#000000</div> <div>rgb(0,0,0)</div>
        <div style="height: 2rem; background: rgb(var(--color-black));" />          <div>black</div>          <div>#0F0F0F</div> <div>rgb(15,15,15)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-1));" />         <div>gray-1</div>         <div>#181919</div> <div>rgb(24,25,25)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-2));" />         <div>gray-2</div>         <div>#222323</div> <div>rgb(34,35,35)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-2a));" />        <div>gray-2a</div>        <div>#282929</div> <div>rgb(40,41,41)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-3));" />         <div>gray-3</div>         <div>#46474A</div> <div>rgb(70,71,74)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-4));" />         <div>gray-4</div>         <div>#6A6A6A</div> <div>rgb(106,106,106)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-4a));" />        <div>gray-4a</div>        <div>#868788</div> <div>rgb(134,135,136)</div>
        <div style="height: 2rem; background: rgb(var(--color-gray-5));" />         <div>gray-5</div>         <div>#A8A4A4</div> <div>rgb(168,164,164)</div>
      </div>
    </div>

    <div>
      <h2 class="margin-block-row">Font and Icon Colors</h2>
      <div class="grid" style="grid-template-columns: 2rem auto auto auto; row-gap: 0.25rem;">
        <div style="height: 2rem; background: rgb(var(--color-nature));" />         <div>nature</div>         <div>#F2F3F0</div> <div>rgb(242,243,240)</div>
        <div style="height: 2rem; background: rgb(var(--color-white));" />          <div>white</div>          <div>#FFFFFF</div> <div>rgb(255,255,255)</div>
        <div style="height: 2rem; background: rgb(var(--color-orange));" />         <div>orange</div>         <div>#F49819</div> <div>rgb(244,152,25)</div>
        <div style="height: 2rem; background: rgb(var(--color-orange-shadow));" />  <div>orange-shadow</div>  <div>#A45A17</div> <div>rgb(164,90,23)</div>
        <div style="height: 2rem; background: rgb(var(--color-orange-lighter));" /> <div>orange-lighter</div> <div>#FCC40E</div> <div>rgb(164,90,23)</div>
        <div style="height: 2rem; background: rgb(var(--color-orange-darker));" />  <div>orange-darker</div>  <div>#E56F0B</div> <div>rgb(164,90,23)</div>
        <div style="height: 2rem; background: rgb(var(--color-cyan));" />           <div>cyan</div>           <div>#21ABBC</div> <div>rgb(33,171,188)</div>
        <div style="height: 2rem; background: rgb(var(--color-cyan-shadow));" />    <div>cyan-shadow</div>    <div>#15636E</div> <div>rgb(21,99,110)</div>
      </div>
    </div>
  </div>
</template>


<script>
export default {};
</script>


<style scoped lang="less">
</style>
