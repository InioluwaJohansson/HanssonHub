const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                                    drag="x"
                                    dragConstraints={{ left: -50, right: 50 }}
                                    onDragEnd={(_, info) => {
                                      if (Math.abs(info.offset.x) > 40) {
                                        setReplyingTo(msg);
                                      }
                                    }}`;

const replacement = `                                    drag="x"
                                    dragConstraints={{ left: isMe ? -80 : 0, right: isMe ? 0 : 80 }}
                                    dragElastic={0.2}
                                    onDragEnd={(_, info) => {
                                      if (isMe && info.offset.x < -40) {
                                        setReplyingTo(msg);
                                      } else if (!isMe && info.offset.x > 40) {
                                        setReplyingTo(msg);
                                      }
                                    }}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
