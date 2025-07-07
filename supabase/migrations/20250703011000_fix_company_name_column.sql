-- Fix the column name to match what the edge function expects
-- The edge function expects 'companyName' but the table might have 'company_name'

-- First, check if the column exists with snake_case name
DO $$
BEGIN
    -- If company_name column exists, rename it to companyName
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_analyzer_outputs' 
        AND column_name = 'company_name'
    ) THEN
        ALTER TABLE public.company_analyzer_outputs RENAME COLUMN company_name TO "companyName";
    END IF;
END $$;

-- If companyName column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_analyzer_outputs' 
        AND column_name = 'companyName'
    ) THEN
        ALTER TABLE public.company_analyzer_outputs ADD COLUMN "companyName" TEXT;
    END IF;
END $$; 