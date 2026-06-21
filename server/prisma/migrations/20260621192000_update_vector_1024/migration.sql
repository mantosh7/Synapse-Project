-- AlterTable
ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(1024);

-- Create index for cosine similarity search
CREATE INDEX ON embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);