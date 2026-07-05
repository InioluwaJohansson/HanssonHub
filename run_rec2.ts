import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const afterUploadTarget = `                                };
                                reader.readAsDataURL(audioBlob);
                              };
                              
                              recorder.start();`;

const afterUploadReplacement = `                                };
                                reader.readAsDataURL(audioBlob);
                                setRecordingState('inactive');
                                setIsRecording(false);
                                setRecordingTime(0);
                                setPlaybackPreviewUrl(null);
                              };
                              
                              recorder.start();`;

if (content.includes(afterUploadTarget)) {
  content = content.replace(afterUploadTarget, afterUploadReplacement);
  console.log('SUCCESS: Replaced after upload UI.');
} else {
  console.log('ERROR: Target after upload not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
