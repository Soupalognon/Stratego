
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- StrategoSoupalognon implementation : © Gabriel Durand <gabriel.durand@hotmail.fr>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

CREATE TABLE IF NOT EXISTS `board` (
  `board_x` smallint(5) unsigned NOT NULL,
  `board_y` smallint(5) unsigned NOT NULL,
  `board_player` int(10) unsigned DEFAULT 0,
  `soldier_type` smallint(5) DEFAULT -1,
  `soldier_id` int(10) DEFAULT 0,
  PRIMARY KEY (`board_x`,`board_y`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `soldier` (
  `soldier_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `soldier_type` smallint(5) unsigned NOT NULL,
  `soldier_name` varchar(16),
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`soldier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `soldiercounter` (
  `player_id` int(11) NOT NULL,
  `counter_type1` smallint(5) unsigned DEFAULT 6,
  `counter_type2` smallint(5) unsigned DEFAULT 1,
  `counter_type3` smallint(5) unsigned DEFAULT 8,
  `counter_type4` smallint(5) unsigned DEFAULT 5,
  `counter_type5` smallint(5) unsigned DEFAULT 4,
  `counter_type6` smallint(5) unsigned DEFAULT 4,
  `counter_type7` smallint(5) unsigned DEFAULT 4,
  `counter_type8` smallint(5) unsigned DEFAULT 3,
  `counter_type9` smallint(5) unsigned DEFAULT 2,
  `counter_type10` smallint(5) unsigned DEFAULT 1,
  `counter_type11` smallint(5) unsigned DEFAULT 1,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB;