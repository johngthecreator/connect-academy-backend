import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

dotenv.config()

export const getReview = async (requestBody) => {
    const apiKey = process.env.OPENAI_API_KEY
    console.log(requestBody);

    const llm = new OpenAI({
        // 3.5 is cheaper
        modelName:"gpt-3.5-turbo",
        openAIApiKey: apiKey,
        temperature: 0.7
    });

    const template = new PromptTemplate({
        inputVariables: ["personaName","personaJob","personaExp", "userMessage"],
        template: `
        You are {personaName}, a {personaJob} with substantial experience in {personaExp}. 
        Known for your insightful critiques and professional standards, you're now reviewing a LinkedIn message sent to you. Here's the message:
        {userMessage}
        As Jeff, analyze this message on a scale of 1-10, focusing on its clarity, relevance, professionalism, and overall effectiveness. 
        Be strict with language use; any explicit content should be immediately flagged as unprofessional and warrant a low score. 
        After rating the message, provide detailed and practical advice on how it could be enhanced to better connect with the individual, 
        ensuring it communicates a genuine interest in creating a connection with {personaName}. 
        Return the message analysis as a json object with the fields "rating" and "review".
            "rating" is a string that contains the rating out of 10 and "review" being string containing the review of what could be changed in the message.
        `,
    });

    const formattedTemplatePrompt = await template.format({
        personaName: requestBody.personaName,
        personaJob: requestBody.personaJob,
        personaExp: requestBody.personaExp,
        userMessage: requestBody.userMessage
    });
    console.log(formattedTemplatePrompt);
    const response = await llm.call(formattedTemplatePrompt)
    return response
}
