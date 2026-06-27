const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                              <div className="flex justify-center my-4 sticky top-14 z-20">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isPagingLoading}
                                  onClick={loadMoreMessages}
                                  className="h-8 rounded-full text-[11px] font-extrabold tracking-wider uppercase px-4 bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm gap-1.5 hover:scale-105 active:scale-95 transition-all"
                                >
                                  {isPagingLoading ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                                      Retrieving Older Logs...
                                    </>
                                  ) : (
                                    <>
                                      <History className="h-3.5 w-3.5 text-[#54656f]" />
                                      Retrieve Archived Messages (Page { (chatCurrentPages[activeChatId || 0] || 1) + 1 })
                                    </>
                                  )}
                                </Button>
                              </div>`;

const replacement = `                              <PullToRefresh onRefresh={async () => { await loadMoreMessages(); }} pullingContent={<div className="text-center p-4 text-xs font-bold text-[#54656f] uppercase tracking-widest"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" /> Pull to load older messages</div>} refreshingContent={<div className="text-center p-4 text-xs font-bold text-primary uppercase tracking-widest"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" /> Loading...</div>}>`;

const targetEnd = `                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </ScrollArea>
                </div>`;

const replacementEnd = `                            </PullToRefresh>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </ScrollArea>
                </div>`;

code = code.replace(target, replacement);
code = code.replace(targetEnd, replacementEnd);
fs.writeFileSync('src/App.tsx', code);
