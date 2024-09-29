export type worldConquest = {
    "version": "0.1.0",
    "name": "world_conquest",
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "gameIdCounter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "createGame",
            "accounts": [
                {
                    "name": "gameIdCounter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "players",
                    "type": {
                        "vec": "publicKey"
                    }
                }
            ]
        },
        {
            "name": "deployTroops",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u8"
                },
                {
                    "name": "territory",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "endTurn",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "recentSlothashes",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "initBattle",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "from",
                    "type": "u8"
                },
                {
                    "name": "to",
                    "type": "u8"
                },
                {
                    "name": "attackingTroops",
                    "type": "u8"
                },
                {
                    "name": "invadingTroops",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "resolveBattle",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "recentSlothashes",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "defendingTroops",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "mooveTroops",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "from",
                    "type": "u8"
                },
                {
                    "name": "to",
                    "type": "u8"
                },
                {
                    "name": "moovingTroops",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "claimBonusReinforcements",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "card1",
                    "type": "u8"
                },
                {
                    "name": "card2",
                    "type": "u8"
                },
                {
                    "name": "card3",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "GameIdCounter",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "id",
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "GameMaster",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "id",
                        "type": "u64"
                    },
                    {
                        "name": "players",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "winner",
                        "type": "publicKey"
                    },
                    {
                        "name": "turnCounter",
                        "type": "u64"
                    },
                    {
                        "name": "troopsToPlay",
                        "type": "u8"
                    },
                    {
                        "name": "troopsPlayed",
                        "type": "u8"
                    },
                    {
                        "name": "territoriesPerPlayer",
                        "type": "bytes"
                    },
                    {
                        "name": "allReinforcementsReceived",
                        "type": "bool"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "map",
                        "type": {
                            "vec": {
                                "defined": "Territorie"
                            }
                        }
                    },
                    {
                        "name": "hasMovedTroops",
                        "type": "bool"
                    },
                    {
                        "name": "claimBonusCounter",
                        "type": "u8"
                    },
                    {
                        "name": "cardsPerPlayer",
                        "type": {
                            "vec": {
                                "defined": "Hand"
                            }
                        }
                    }
                ]
            }
        },
        {
            "name": "Battle",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "hasBattle",
                        "type": "bool"
                    },
                    {
                        "name": "attacker",
                        "type": "publicKey"
                    },
                    {
                        "name": "attackingTerritory",
                        "type": "u8"
                    },
                    {
                        "name": "attackerTroops",
                        "type": "u8"
                    },
                    {
                        "name": "invasionTroops",
                        "type": "u8"
                    },
                    {
                        "name": "defender",
                        "type": "publicKey"
                    },
                    {
                        "name": "defenderTroops",
                        "type": "u8"
                    },
                    {
                        "name": "attackedTerritory",
                        "type": "u8"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "attackerDiceResult",
                        "type": "bytes"
                    },
                    {
                        "name": "defenderDiceResult",
                        "type": "bytes"
                    },
                    {
                        "name": "hasConquered",
                        "type": "bool"
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "Territorie",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "troops",
                        "type": "u8"
                    },
                    {
                        "name": "ruler",
                        "type": "publicKey"
                    },
                    {
                        "name": "borders",
                        "type": "bytes"
                    }
                ]
            }
        },
        {
            "name": "Hand",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "cards",
                        "type": "bytes"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "NumberTroopsExceeded",
            "msg": "You can't have more troops on this territory (max 255)"
        },
        {
            "code": 6001,
            "name": "InvalidCardsCombinaison",
            "msg": "You can't claim bonus, you don't have the necessary cards"
        }
    ]
}
export const IDL: worldConquest = {
    "version": "0.1.0",
    "name": "world_conquest",
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "gameIdCounter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "createGame",
            "accounts": [
                {
                    "name": "gameIdCounter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "players",
                    "type": {
                        "vec": "publicKey"
                    }
                }
            ]
        },
        {
            "name": "deployTroops",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "amount",
                    "type": "u8"
                },
                {
                    "name": "territory",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "endTurn",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "recentSlothashes",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "initBattle",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "from",
                    "type": "u8"
                },
                {
                    "name": "to",
                    "type": "u8"
                },
                {
                    "name": "attackingTroops",
                    "type": "u8"
                },
                {
                    "name": "invadingTroops",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "resolveBattle",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "recentSlothashes",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "defendingTroops",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "mooveTroops",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "from",
                    "type": "u8"
                },
                {
                    "name": "to",
                    "type": "u8"
                },
                {
                    "name": "moovingTroops",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "claimBonusReinforcements",
            "accounts": [
                {
                    "name": "gameMaster",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "battle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameId",
                    "type": "u64"
                },
                {
                    "name": "card1",
                    "type": "u8"
                },
                {
                    "name": "card2",
                    "type": "u8"
                },
                {
                    "name": "card3",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "GameIdCounter",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "id",
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "GameMaster",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "id",
                        "type": "u64"
                    },
                    {
                        "name": "players",
                        "type": {
                            "vec": "publicKey"
                        }
                    },
                    {
                        "name": "winner",
                        "type": "publicKey"
                    },
                    {
                        "name": "turnCounter",
                        "type": "u64"
                    },
                    {
                        "name": "troopsToPlay",
                        "type": "u8"
                    },
                    {
                        "name": "troopsPlayed",
                        "type": "u8"
                    },
                    {
                        "name": "territoriesPerPlayer",
                        "type": "bytes"
                    },
                    {
                        "name": "allReinforcementsReceived",
                        "type": "bool"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "map",
                        "type": {
                            "vec": {
                                "defined": "Territorie"
                            }
                        }
                    },
                    {
                        "name": "hasMovedTroops",
                        "type": "bool"
                    },
                    {
                        "name": "claimBonusCounter",
                        "type": "u8"
                    },
                    {
                        "name": "cardsPerPlayer",
                        "type": {
                            "vec": {
                                "defined": "Hand"
                            }
                        }
                    }
                ]
            }
        },
        {
            "name": "Battle",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "hasBattle",
                        "type": "bool"
                    },
                    {
                        "name": "attacker",
                        "type": "publicKey"
                    },
                    {
                        "name": "attackingTerritory",
                        "type": "u8"
                    },
                    {
                        "name": "attackerTroops",
                        "type": "u8"
                    },
                    {
                        "name": "invasionTroops",
                        "type": "u8"
                    },
                    {
                        "name": "defender",
                        "type": "publicKey"
                    },
                    {
                        "name": "defenderTroops",
                        "type": "u8"
                    },
                    {
                        "name": "attackedTerritory",
                        "type": "u8"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "attackerDiceResult",
                        "type": "bytes"
                    },
                    {
                        "name": "defenderDiceResult",
                        "type": "bytes"
                    },
                    {
                        "name": "hasConquered",
                        "type": "bool"
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "Territorie",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "troops",
                        "type": "u8"
                    },
                    {
                        "name": "ruler",
                        "type": "publicKey"
                    },
                    {
                        "name": "borders",
                        "type": "bytes"
                    }
                ]
            }
        },
        {
            "name": "Hand",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "cards",
                        "type": "bytes"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "NumberTroopsExceeded",
            "msg": "You can't have more troops on this territory (max 255)"
        },
        {
            "code": 6001,
            "name": "InvalidCardsCombinaison",
            "msg": "You can't claim bonus, you don't have the necessary cards"
        }
    ]
}