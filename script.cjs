const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Action Modals DialogContent stripping
const actionModalDialogNames = ['isViewActionOpen', 'isAddActionOpen', 'isEditActionOpen', 'isAddActionStepOpen', 'isEditActionStepOpen'];

code = code.replace(/<Dialog open=\{([^}]+)\} onOpenChange=\{([^}]+)\}>\s*<DialogContent ([^>]+)>/g, (match, openVal, openChange, contentProps) => {
  if (['isViewActionOpen', 'isAddActionOpen', 'isEditActionOpen', 'isAddActionStepOpen', 'isEditActionStepOpen'].includes(openVal)) {
    // Strip border-none, rounded-[2rem], shadow-2xl, bg-slate-50, etc.
    let newProps = contentProps.replace(/border-none|shadow-2xl|bg-slate-50|dark:bg-slate-900|rounded-\[2rem\]|p-0|overflow-hidden|max-h-\[90vh\]/g, '').replace(/\s+/g, ' ');
    return `<Dialog open={${openVal}} onOpenChange={${openChange}}>\n        <DialogContent ${newProps.trim()}>`;
  }
  return match;
});

// 2. Button resizing in Create Action and Edit Action
code = code.replace(/<Button\s+className="w-full h-12 rounded-2xl font-bold [^"]+"\s*(onClick=\{[^}]+\})\s*>/g, (match, onClickPair) => {
    return `<Button ${onClickPair}>`;
});

// 3. Fix the "No integer after selection" issue!
// The user doesn't want to see integers anywhere in the select list for category or person.
// I will ensure <SelectItem> ONLY renders the name instead of anything like Name (ID) if I had it. 
// However, the issue might be that base-ui <SelectValue> shows an integer when matching a string integer type instead of the select item content if types are mismatched.
// To fix it universally, I will ensure `<SelectValue>` DOES NOT render the primitive value, but uses a controlled state text!
// Wait, base-ui handles it properly if the `value` type matches the `SelectItem` `value`. Let's ensure value is string.
// `value={cat.id.toString()}` and `newContact.contactCategory.toString()`. Wait!
code = code.replace(/<Select\s+value=\{([^}]+)\}\s+onValueChange=\{([^}]+)\}/g, (match, valStr, onChangeStr) => {
    if (valStr === "newContact.contactCategory" || valStr === "newContact.contactCategory.toString()") {
        return `<Select value={newContact.contactCategory?.toString()} onValueChange={${onChangeStr}}`;
    }
    return match;
});

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced action modal properties and button sizes.");
