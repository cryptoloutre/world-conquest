use anchor_lang::prelude::*;
use crate::types::Territorie;

pub fn init_map() -> Vec<Territorie> {
    let mut map = vec![
        Territorie {
            troops: 0,
            ruler: Pubkey::default(),
            borders: vec![],
        };
        42
    ];

    map[0] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![1, 3, 29],
    };

    map[1] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![0, 2, 3, 4],
    };

    map[2] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![1, 4, 5, 13],
    };

    map[3] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![0, 1, 4, 6],
    };

    map[4] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![1, 2, 3, 5, 6, 7],
    };

    map[5] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![2, 4, 7],
    };

    map[6] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![3, 4, 7, 8],
    };

    map[7] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![4, 5, 6, 8],
    };

    map[8] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![6, 7, 9],
    };

    map[9] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![8, 10, 11],
    };

    map[10] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![9, 11, 12],
    };

    map[11] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![9, 10, 12, 20],
    };

    map[12] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![10, 11],
    };
    map[13] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![2, 14, 16],
    };
    map[14] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![13, 15, 17],
    };
    map[15] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![14, 17, 19, 26 ,31, 35],
    };
    map[16] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![13, 17, 18],
    };
    map[17] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![14, 15, 16, 18, 19],
    };
    map[18] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![16, 17, 19, 20],
    };
    map[19] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![15, 17, 18, 20, 21, 35],
    };
    map[20] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![11, 18, 19, 21, 22, 23],
    };
    map[21] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![19, 20, 22, 35],
    };
    map[22] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![20, 21, 23, 24, 25, 35],
    };
    map[23] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![20, 22, 24],
    };
    map[24] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![22, 23, 25],
    };
    map[25] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![22, 24],
    };
    map[26] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![15, 27, 31, 32],
    };
    map[27] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![26, 28, 30, 32, 33],
    };
    map[28] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![27, 29, 30],
    };
    map[29] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![0, 28, 30, 33, 34],
    };
    map[30] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![27, 28, 29, 33],
    };
    map[31] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![15, 26, 32, 35, 36],
    };
    map[32] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![26, 27, 31, 33, 36, 37],
    };
    map[33] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![27, 29, 30, 32, 34],
    };
    map[34] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![29, 33],
    };
    map[35] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![15, 19, 21, 22, 31, 36],
    };
    map[36] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![31, 32, 35, 37],
    };
    map[37] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![32, 36, 38],
    };
    map[38] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![37, 39, 40],
    };
    map[39] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![38, 40, 41],
    };
    map[40] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![38, 39, 41],
    };
    map[41] = Territorie {
        troops: 0,
        ruler: Pubkey::default(),
        borders: vec![39, 40],
    };

    return map;
}
