import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const recordingTarget = `                <div className="relative">
                  {isRecording ? (
                        <div className="flex-1 h-12 flex items-center px-4 bg-white rounded-xl shadow-sm border animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3 w-full">
                            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                            <span className="text-sm font-bold text-[#111b21] min-w-[50px] shrink-0">
                              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </span>
                            <div className="flex-1 flex items-center justify-center gap-1.5 h-8">
                               {Array.from({length: 16}).map((_, i) => (
                                 <div 
                                   key={i} 
                                   className="w-1.5 bg-[#1DB954] rounded-full spotify-bar" 
                                   style={{ 
                                      animationDelay: \`\${i * 0.08}s\`,
                                      animationDuration: \`\${0.6 + Math.random() * 0.4}s\`
                                   }} 
                                 />
                               ))}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive font-bold h-8 px-2 shrink-0"
                              onClick={() => {
                                if (mediaRecorderRef.current) {
                                  (mediaRecorderRef.current as any).isCancelled = true;
                                  if (mediaRecorderRef.current.state === 'recording') {
                                    mediaRecorderRef.current.stop();
                                  }
                                }
                                setIsRecording(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (`;

const recordingReplacement = `                <div className="relative">
                  {recordingState !== 'inactive' ? (
                        <div className="flex-1 h-12 flex items-center px-4 bg-white rounded-xl shadow-sm border animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3 w-full">
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive shrink-0 h-8 w-8 rounded-full"
                              onClick={() => {
                                if (mediaRecorderRef.current) {
                                  (mediaRecorderRef.current as any).isCancelled = true;
                                  if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
                                    mediaRecorderRef.current.stop();
                                  }
                                }
                                setIsRecording(false);
                                setRecordingState('inactive');
                                setRecordingTime(0);
                                if (playbackAudioRef.current) {
                                  playbackAudioRef.current.pause();
                                  playbackAudioRef.current.src = "";
                                }
                                setPlaybackPreviewUrl(null);
                                setPlaybackPreviewPlaying(false);
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>

                            <div className="flex-1 flex items-center justify-center gap-4 h-8">
                               {recordingState === 'recording' && (
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className="h-8 w-8 text-primary rounded-full hover:bg-slate-100"
                                   onClick={() => {
                                      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                        mediaRecorderRef.current.pause();
                                        setRecordingState('paused');
                                      }
                                   }}
                                 >
                                   <Pause className="h-5 w-5 fill-current" />
                                 </Button>
                               )}

                               {recordingState === 'paused' && (
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className="h-8 w-8 text-primary rounded-full hover:bg-slate-100"
                                   onClick={() => {
                                      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
                                        mediaRecorderRef.current.resume();
                                        setRecordingState('recording');
                                        if (playbackAudioRef.current) {
                                          playbackAudioRef.current.pause();
                                          setPlaybackPreviewPlaying(false);
                                        }
                                      }
                                   }}
                                 >
                                   <Mic className="h-5 w-5 fill-current" />
                                 </Button>
                               )}
                               
                               {recordingState === 'paused' && (
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className="h-8 w-8 text-primary rounded-full hover:bg-slate-100"
                                   onClick={async () => {
                                      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
                                         if (!playbackPreviewUrl) {
                                            // Request current data to create a blob for preview
                                            mediaRecorderRef.current.requestData();
                                            // Need to wait slightly for ondataavailable to fire
                                            setTimeout(() => {
                                              const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                                              const url = URL.createObjectURL(blob);
                                              setPlaybackPreviewUrl(url);
                                              if (playbackAudioRef.current) {
                                                playbackAudioRef.current.src = url;
                                                playbackAudioRef.current.play();
                                                setPlaybackPreviewPlaying(true);
                                              }
                                            }, 100);
                                         } else if (playbackAudioRef.current) {
                                            if (playbackPreviewPlaying) {
                                              playbackAudioRef.current.pause();
                                              setPlaybackPreviewPlaying(false);
                                            } else {
                                              playbackAudioRef.current.play();
                                              setPlaybackPreviewPlaying(true);
                                            }
                                         }
                                      }
                                   }}
                                 >
                                   {playbackPreviewPlaying ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                                 </Button>
                               )}
                            </div>

                            {recordingState === 'recording' && (
                              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                            )}
                            <span className="text-sm font-bold text-[#111b21] min-w-[45px] shrink-0 text-right">
                              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      ) : (`;

const btnTarget = `                <div className="flex items-center shrink-0">
                      {isRecording ? (
                        <Button 
                          onClick={() => {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                              mediaRecorderRef.current.stop();
                              // The actual message sending will happen in onstop event
                            } else {
                              setIsRecording(false);
                            }
                          }}
                          className="rounded-full h-11 w-11 bg-primary text-white shadow-lg flex items-center justify-center p-0 animate-in zoom-in"
                        >
                          <Send className="h-6 w-6 fill-current" />
                        </Button>
                      ) : chatInput.trim() ? (
                        <Button 
                          onClick={() => handleSendMessage()}
                          className="rounded-full h-11 w-11 bg-transparent hover:bg-slate-200/50 text-[#1fa855] shadow-none flex items-center justify-center p-0 transition-transform active:scale-90"
                        >
                          <Send className="h-7 w-7 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "rounded-full h-11 w-11 text-[#54656f] transition-all relative overflow-hidden",
                            isRecording && "bg-destructive text-white scale-110 shadow-lg"
                          )}
                          onClick={async () => {
                            try {
                              const startTime = Date.now();
                              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                              setIsRecording(true);
                              (window as any).lastTypingSentTime = Date.now();
                              apiFetch(\`/Message/Typing?chatId=\${activeChatId}&action=\${encodeURIComponent('recording voice message')}\`, { method: 'POST' }).catch(() => {});
                              
                              const recorder = new MediaRecorder(stream);
                              mediaRecorderRef.current = recorder;
                              audioChunksRef.current = [];
                              
                              recorder.ondataavailable = (e) => {
                                if (e.data.size > 0) {
                                  audioChunksRef.current.push(e.data);
                                }
                              };
                              
                              recorder.onstop = () => {
                                // Stop all tracks
                                stream.getTracks().forEach(track => track.stop());

                                if ((recorder as any).isCancelled) {
                                  setIsRecording(false);
                                  return;
                                }

                                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                                const duration = Math.round((Date.now() - startTime) / 1000) || 1;
                                const reader = new FileReader();
                                reader.onloadend = async () => {`;

const btnReplacement = `                <div className="flex items-center shrink-0">
                      {recordingState !== 'inactive' ? (
                        <Button 
                          onClick={() => {
                            if (mediaRecorderRef.current) {
                               // Make sure we get the final chunk
                              if (mediaRecorderRef.current.state === 'paused') {
                                 mediaRecorderRef.current.resume();
                              }
                              setTimeout(() => {
                                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                  mediaRecorderRef.current.stop();
                                }
                              }, 50);
                              // The actual message sending will happen in onstop event
                            } else {
                              setIsRecording(false);
                              setRecordingState('inactive');
                            }
                          }}
                          className="rounded-full h-11 w-11 bg-primary text-white shadow-lg flex items-center justify-center p-0 animate-in zoom-in"
                        >
                          <Send className="h-6 w-6 fill-current" />
                        </Button>
                      ) : chatInput.trim() ? (
                        <Button 
                          onClick={() => handleSendMessage()}
                          className="rounded-full h-11 w-11 bg-transparent hover:bg-slate-200/50 text-[#1fa855] shadow-none flex items-center justify-center p-0 transition-transform active:scale-90"
                        >
                          <Send className="h-7 w-7 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "rounded-full h-11 w-11 text-[#54656f] transition-all relative overflow-hidden",
                            recordingState !== 'inactive' && "bg-destructive text-white scale-110 shadow-lg"
                          )}
                          onClick={async () => {
                            try {
                              const startTime = Date.now();
                              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                              setIsRecording(true);
                              setRecordingState('recording');
                              setRecordingTime(0);
                              setPlaybackPreviewUrl(null);
                              setPlaybackPreviewPlaying(false);
                              
                              (window as any).lastTypingSentTime = Date.now();
                              apiFetch(\`/Message/Typing?chatId=\${activeChatId}&action=\${encodeURIComponent('recording voice message')}\`, { method: 'POST' }).catch(() => {});
                              
                              const recorder = new MediaRecorder(stream);
                              mediaRecorderRef.current = recorder;
                              audioChunksRef.current = [];
                              
                              recorder.ondataavailable = (e) => {
                                if (e.data.size > 0) {
                                  audioChunksRef.current.push(e.data);
                                }
                              };
                              
                              recorder.onstop = () => {
                                // Stop all tracks
                                stream.getTracks().forEach(track => track.stop());

                                if ((recorder as any).isCancelled) {
                                  setIsRecording(false);
                                  setRecordingState('inactive');
                                  return;
                                }

                                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                                const duration = Math.round((Date.now() - startTime) / 1000) || 1;
                                const reader = new FileReader();
                                reader.onloadend = async () => {`;

const afterUploadTarget = `                                    const savedMsgRaw = await apiFetch<MessageDto>(\`/Message/SendMessageChatId?chatId=\${sendDto.chatId}\`, {
                                      method: 'POST',
                                      body: formData
                                    });
                                    const savedMsg = normalizeMessage(savedMsgRaw);
                                    setChatMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent' } : m));
                                  } catch (err: any) {
                                    setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
                                    toast.error(err.message || "Failed to send message");
                                  }
                                };
                                reader.readAsDataURL(audioBlob);
                              };
                              
                              recorder.start();
                            } catch (err) {
                              toast.error("Microphone access denied");
                            }
                          }}
                        >
                          <Mic className="h-6 w-6" />
                        </Button>
                      )}
                    </div>`;

const afterUploadReplacement = `                                    const savedMsgRaw = await apiFetch<MessageDto>(\`/Message/SendMessageChatId?chatId=\${sendDto.chatId}\`, {
                                      method: 'POST',
                                      body: formData
                                    });
                                    const savedMsg = normalizeMessage(savedMsgRaw);
                                    setChatMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent' } : m));
                                  } catch (err: any) {
                                    setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
                                    toast.error(err.message || "Failed to send message");
                                  }
                                };
                                reader.readAsDataURL(audioBlob);
                                setRecordingState('inactive');
                                setIsRecording(false);
                                setRecordingTime(0);
                                setPlaybackPreviewUrl(null);
                              };
                              
                              recorder.start();
                            } catch (err) {
                              toast.error("Microphone access denied");
                            }
                          }}
                        >
                          <Mic className="h-6 w-6" />
                        </Button>
                      )}
                    </div>`;


if (content.includes(recordingTarget)) {
  content = content.replace(recordingTarget, recordingReplacement);
  console.log('SUCCESS: Replaced recording container UI.');
} else {
  console.log('ERROR: Target recording UI not found.');
}

if (content.includes(btnTarget)) {
  content = content.replace(btnTarget, btnReplacement);
  console.log('SUCCESS: Replaced mic button UI.');
} else {
  console.log('ERROR: Target mic button not found.');
}

if (content.includes(afterUploadTarget)) {
  content = content.replace(afterUploadTarget, afterUploadReplacement);
  console.log('SUCCESS: Replaced after upload UI.');
} else {
  console.log('ERROR: Target after upload not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
