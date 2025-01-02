document.querySelectorAll('pre > code').forEach((codeblock) => {
  const copybutton = document.createElement('button');
  copybutton.classList.add('copy-code');
  copybutton.innerHTML = 'copy';

  function copyingDone() {
    copybutton.innerHTML = 'copied!';
    setTimeout(() => {
      copybutton.innerHTML = 'copy';
    }, 2000);
  }

  copybutton.addEventListener('click', (cb) => {
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(codeblock.textContent);
      copyingDone();
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(codeblock);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      document.execCommand('copy');
      copyingDone();
    } catch (e) { };
    selection.removeRange(range);
  });

  const container = codeblock.parentNode;
  container.appendChild(copybutton);
});
