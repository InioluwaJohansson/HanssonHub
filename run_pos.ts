import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the context menu positioning logic
const dropdownWidthTarget = `                    const dropdownWidth = 224; // w-56 is 224px
                    const dropdownHeight = isFailed ? 150 : (isMe && msg.type === MessageType.Text ? 245 : 210);
                    
                    let targetLeft = 0;
                    if (isMe) {
                      // Message is sent by me (on the right), place menu on the left of the message bubble
                      targetLeft = relativeLeft - dropdownWidth - 8;
                      // Fallback: if it overflows the left screen edge, fallback to aligning with right edge of bubble
                      if (targetLeft < 16) {
                        targetLeft = relativeLeft + selectedMessageRect.width - dropdownWidth;
                      }
                    } else {
                      // Message is sent by someone else (on the left), place menu on the right of the message bubble
                      targetLeft = relativeLeft + selectedMessageRect.width + 8;
                      // Fallback: if it overflows the right screen edge, fallback to aligning with left edge of bubble
                      if (targetLeft + dropdownWidth > containerRect.width - 16) {
                        targetLeft = relativeLeft;
                      }
                    }
                    
                    // Keep horizontally bound inside messages area with safe padding
                    targetLeft = Math.max(16, Math.min(containerRect.width - dropdownWidth - 16, targetLeft));
                    
                    // Vertically center/align with message bubble, bounded to stay completely within visible container boundaries
                    let targetTop = relativeTop + (selectedMessageRect.height - dropdownHeight) / 2;
                    targetTop = Math.max(16, Math.min(containerRect.height - dropdownHeight - 16, targetTop));`;

const dropdownWidthReplacement = `                    const dropdownWidth = 224; // w-56 is 224px
                    const dropdownHeight = isFailed ? 150 : (isMe && msg.type === MessageType.Text ? 245 : 210);
                    
                    const spaceBelow = containerRect.height - (relativeTop + selectedMessageRect.height);
                    const spaceAbove = relativeTop;
                    
                    const positionY = (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) ? 'below' : 'above';
                    
                    let targetTop = positionY === 'below' 
                      ? relativeTop + selectedMessageRect.height + 8
                      : relativeTop - dropdownHeight - 8;
                      
                    let targetLeft = isMe 
                      ? relativeLeft + selectedMessageRect.width - dropdownWidth 
                      : relativeLeft;
                      
                    // Keep horizontally bound inside messages area with safe padding
                    targetLeft = Math.max(16, Math.min(containerRect.width - dropdownWidth - 16, targetLeft));`;

if (content.includes(dropdownWidthTarget)) {
  content = content.replace(dropdownWidthTarget, dropdownWidthReplacement);
  console.log('SUCCESS: Replaced context menu positioning logic.');
} else {
  console.log('ERROR: Target dropdownWidth not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
