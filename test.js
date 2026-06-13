const text = `<think>\nUser name is 12ds.\n</think>\n12ds, I am sorry`;
console.log(text.replace(/<think>[\s\S]*?(<\/think>|$)/gi, ''));
