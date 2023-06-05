
# From Prompt To Cloud
Movie recommendation and reviews generated with OpenAI `gpt.3-5-turbo` based on the user input.

## Application Flow
1. Begin by navigating to the desired web page.
2. Provide a brief description of yourself using a few words.
3. Behind the scenes, a backend call will be made to OpenAI, which will retrieve three movie suggestions as JSON.
4. Additionally, a call will be made to 'themoviedb' to fetch reviews for each of the recommended movies.
5. Finally, another call to OpenAI will be made to obtain positive and negative aspects of each movie.

## Objectives

At the end of this tutorial you will be able to:
 - Create a prompt as a proffesional
 - Use OpenAI SDK and integrate OpenAi In the programatic way
 - Avoid classic mistakes of prompt engineering
 - Deploy a full stackk application on genezio

## Introduction
Welcome to this tutorial on creating advanced prompts and integrating OpenAI using the OpenAI SDK.

Creating compelling prompts is essential for obtaining accurate and relevant responses from language models. We will explore various techniques and strategies to craft prompts that yield desired outputs, making your interactions with AI models more efficient and effective.

The OpenAI SDK is a powerful tool that enables seamless integration of OpenAI's language models into your applications. Prompt engineering can be a challenging task, often prone to mistakes that can negatively impact the quality of the generated outputs.  

Get ready to enhance your prompt creation skills, avoid classic mistakes and deploy your own full-stack application on Genezio.

Let's dive in and unlock the true potential of OpenAI for your projects!

## Used Tools
	nu stiu daca e nevoie sa spun ceva aici :)

## Getting started
### Configuration & Prerequisites
1. Install `node & npm` https://nodejs.org/en/download
2. Install genezio: `npm install genezio -g`
3. Get the API Key from OpenAI:
 - Open https://openai.com/ and click on `Sign Up`
 -  After you log in go to: https://platform.openai.com/account/api-keys
 - Click `Create new secret key` and give it a name
 - Save somewhere safe the generated secret key, we will need it later on

### Clone the template
Clone the following repo:

	git clone https://github.com/Genez-io/techsylvania_workshop

This repository contains 2 folders. I recommend you to open it with an IDE:
 - `client` - all the frontend logic written in React
 - `server` - all the backend logic without the prompt that we will create in the next step

### Open the backend

 1. `cd ./techsylvania_workshop/server`
 2. `npm install`
 3. Create a file named `.env` and add `OPENAI_SECRET_KEY=<your_openai_secret_key>`
 4. `genezio local`
 5.  Go to https://app.genez.io/test-interface/local?port=8083 to test your backend - **it will not work with Safari**

### Let's create the Prompts
#### Get Movies recommendation by user input
We will create the prompt in an interative way.
Keep in mind that is almost impossible to create a perfect prompt from the first try.

First, let's think about what we want to achieve with this prompt:
 1. Get the user input and integrate it in a prompt
 2. Get movie suggestions
 3. Generate the Output in a desired way
 4. Control the length of the output

Let's try a prompt like this one:

	// this will be dynamic
	userInput = `I am a person that likes to play tennis, 
	I am working as a software developer and in the last year I've read: 
	Are You There, Vodka?, Do Androids Dream of Electric Sheep?.`
	
	prompt = `${userInput} Create a list with 3 movies that the user would like to watch based on the text.
	Create the output as JSON without any aditional text, note or informations a 
	one-liner with a field called "movies" which is an array of objects and each 
	object contains a field called "title" and a field called "releaseDate" without 
	any additional explanations.`
We can now test this prompt in `movie.ts` on the function ` recommendMoviesBasedOnDescription` at `this.openai.createChatCompletion`. 
After we add the prompt we can test with userInput from the **Test Interface**:
https://app.genez.io/test-interface/local?port=8083.

We will see that the prompt works just fine, but in the way we did it, it's easy for a user to *hack* into your system with **prompt injection**. This means that the user can to some prompt engineering to cancel our prompt and generate whatever he wants.

A prompt that works perfect and doesn't have this problem would be:

	prompt = `Between """ """ I will write what a person says about themselves. 
	Create a list with 3 movies that the person would like to watch 
	based on the text. Create the output as JSON one-liner with a 
	field called "movies" which is an array of objects and each 
	object contains a field called "title" and a field called 
	"releaseDate" without any additional explanations.

    """
    ${userInput}
    """` 

#### Get Movies Reviews Summary
Now we will work in the function `getReviewSummary` from `movie.ts`.
This prompt is easier than the previous one because here we control the input and we don't have the problem with prompt injection.
We only give a list of reviews and give to OpenAi the task to analyze the advantages and disadvantages of watching that movie.
The prompt should be something like this:

	prompt = `Here is a list of reviews for one movie. One review is delimited by ||| marks.
	${reviews.map((x: string) =>  `|||${x.length  >  100 ? x.substring(0, 100) : x}|||`).join("\n")}
	Your task is to analyze each review and give me a list of advantages and
	disadvantages to watch the movie.
	The result should be one JSON object with two fields "advantages" and "disadvantages".
	Synthesize the reviews in these two fields. The advantages should contain the positives
	and the disadvantages the negatives. Don't use more than 30 words for each.
	Don't include anything else besides the JSON.`
 We use the delimiter `|||` to help the model understand easier where are the given reviews in the prompt.

### Test the full-stack app
Now we have the backend complete and we can test also the frontend application.
In a new terminal start the frontend application:

 1. `cd ./../client`
 2. `npm install`
 3. `npm start`
 4. Go to http://localhost:3000 to try your app

### Deploy your app
If everything goes well you can now deploy your application on genezio's infrasctructure.
In the server folder:

 1. `genezio login`
 2. `genezio deploy`

This action might take up to 2 minutes and after that a random genezio subdomain will be provided for you with your deployed application.


## Conclusion

I hope this tutorial has equipped you with the necessary skills to create professional prompts, integrate OpenAI using the OpenAI SDK, avoid common prompt engineering mistakes, and deploy a full-stack application on Genezio.

Now you can confidently leverage the power of OpenAI's language models and unleash their potential in your projects.

Get ready to take your AI interactions to new heights!

## What's next?
We at genezio aim to offer our users the best experience possible while having access to excellent time and money saving services.
Stay tuned and join our  [Discord community](https://discord.gg/uc9H5YKjXv)  to be the first to hear about new tutorials and features.
