# Quick Start Guide

Get your Survey Analysis Platform up and running in 5 minutes!

## Step 1: Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **IMPORTANT**: Save it somewhere safe - you won't see it again!

## Step 2: Configure the Application

1. Open the file `.env.local` in the project folder
2. Replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-proj-abc123xyz...
   ```
3. Save the file

## Step 3: Start the Development Server

Open a terminal in the project folder and run:

```bash
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

## Step 4: Open the Application

1. Open your web browser
2. Go to: [http://localhost:3000](http://localhost:3000)
3. You should see the Survey Analysis Platform home page!

## Step 5: Try It Out with Sample Data

### 5.1 Configure a Project

1. Click **"Get Started"**
2. Fill in the form:
   - **Project Name**: "Test Commercial Analysis"
   - **Study Type**: Select "Commercial Evaluation"
   - **Brand**: "Coca-Cola"
   - **Objective**: "Evaluate message clarity and emotional impact"
   - **Study Phase**: Select "Exploratory"
3. Click **"Continue to Upload Data"**

### 5.2 Upload Sample Data

1. Click **"Click to upload"**
2. Select the `sample-data.csv` file included in the project
3. You'll see 20 responses loaded
4. The questions are auto-selected:
   - Brand_Recall
   - Commercial_Feedback
   - Purchase_Intent
5. Click **"Continue to Analysis"**

### 5.3 Process the Data

1. Review the 3 questions that will be analyzed
2. Click **"Start Analysis"**
3. Wait 2-3 minutes while the AI processes the responses
4. You'll see progress updates for each step

### 5.4 View Results

1. Once complete, you'll see the Results dashboard
2. Click on different questions in the left sidebar
3. For opinion questions, you'll see:
   - **Thematic Nets**: High-level categories (e.g., "Message & Communication")
   - **Codes**: Specific themes with sentiment (e.g., "Clear message - Positive")
   - **Sample Responses**: Individual answers with their classifications
4. Click **"Export Results"** to download a CSV file

## What Just Happened?

The AI analyzed your survey responses and:
- ✅ Classified each question as REFERENCE or OPINION
- ✅ Extracted key themes (codes) from open-ended responses
- ✅ Grouped codes into broader categories (nets)
- ✅ Added sentiment analysis (Positive/Neutral/Negative)
- ✅ Classified every individual response

## Next Steps

### Use Your Own Data

1. Prepare a CSV or Excel file with your survey data
2. Format: One row per respondent, one column per question
3. Include a respondent ID column
4. Upload and analyze!

### Customize for Your Needs

- **Edit Study Types**: Modify `types/index.ts` to add your own frameworks
- **Adjust AI Prompts**: Edit files in `lib/llm/prompts.ts`
- **Change AI Model**: Update `lib/llm/client.ts` (e.g., use GPT-4o instead of mini)
- **Add New Features**: The codebase is fully open and extensible!

## Common Issues

### "No response from OpenAI"
- Check your API key is correct in `.env.local`
- Verify you have credits in your OpenAI account
- Check your internet connection

### "Failed to parse file"
- Ensure your CSV/Excel file is properly formatted
- Check for special characters or encoding issues
- Try the sample data first to verify everything works

### Port 3000 already in use
- Stop other applications using port 3000
- Or change the port: `npm run dev -- -p 3001`

## Cost Estimate

Using GPT-4o-mini with the sample data (20 responses, 3 questions):
- **Cost**: ~$0.02 - $0.05 USD
- Actual costs depend on response length

For production use:
- 100 responses, 10 questions: ~$0.50 - $2.00
- 1000 responses, 10 questions: ~$5.00 - $20.00

💡 **Tip**: Set spending limits in your OpenAI dashboard!

## Need Help?

1. Check the main [README.md](README.md) for detailed documentation
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
3. Open an issue on GitHub if you encounter bugs

## Ready to Deploy?

Once you've tested locally and everything works:

1. See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions
2. Recommended: Deploy to [Vercel](https://vercel.com) (free for hobby projects)
3. Remember to set the `OPENAI_API_KEY` environment variable in production!

---

Happy analyzing! 🎉
