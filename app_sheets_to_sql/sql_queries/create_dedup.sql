DELIMITER $$

CREATE PROCEDURE deduplicate_sheets_table()
BEGIN
	DELETE L 
	FROM main.sheets L
	INNER JOIN main.sheets R 
		ON L.COLUMN = R.COLUMN
	WHERE L.`index` < R.`index`;
END $$

DELIMITER ;