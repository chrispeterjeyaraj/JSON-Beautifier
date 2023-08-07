function _linkify(inputText) {
  //URLs starting with http://, https://, or ftp://
  // deno-lint-ignore prefer-const
  let P1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    // deno-lint-ignore prefer-const
    P2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
    //Change email addresses to mailto:: links.
    // deno-lint-ignore prefer-const
    P3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim,
    text = inputText.replace(
      P1,
      '<a class="JB_linkify-link" href="$1" target="_blank">$1</a>'
    );
  text = text.replace(
    P2,
    '$1<a class="JB_linkify-link" href="http://$2" target="_blank">$2</a>'
  );
  text = text.replace(P3, '<a class="JB_linkify-link" href="mailto:$1">$1</a>');
  return text;
}
