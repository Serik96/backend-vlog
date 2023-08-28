import PostModel from "../models/Post.js";

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);
    res.json(tags);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить тэги",
    });
  }
};

export const getAllPopular = async (req, res) => {
  try {
    const popularPosts = await PostModel.find()
      .populate("user")
      .sort({ viewsCount: -1 })
      .exec();
    res.json(popularPosts);
  } catch (error) {
    console.log("getAllPopular", error);
    res.status(400).json({
      message: "Не удалось получить популярные статьи",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("user")
      .sort({ createdAt: -1 }) // Сортировка по убыванию даты создания
      .exec();

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const getTagFamily = async (req, res) => {
  try {
    const postTag = req.params.tag; // Параметр тега из запроса

    const documentsWithTag = await PostModel.find({ tags: postTag })
      .populate("user")
      .exec();

    if (documentsWithTag.length === 0) {
      return res.status(404).json({
        message: "Статьи с указанным тегом не найдены",
      });
    }

    res.json(documentsWithTag);
  } catch (error) {
    console.log("getTagFamily", error);
    res.status(500).json({
      message: "Не удалось получить статьи по тегу",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const updatedDocument = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        new: true,
      }
    )
      .populate("user")
      .exec();

    if (!updatedDocument) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }

    res.json(updatedDocument);
  } catch (error) {
    console.log("getOne", error);
    res.status(500).json({
      message: "Не удалось получить статью",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    const deletedDocument = await PostModel.findByIdAndDelete(postId).exec();

    if (!deletedDocument) {
      return res.status(404).json({
        message: "Не удалось найти статью",
      });
    }

    res.json(deletedDocument);
  } catch (error) {
    console.log("remove", error);
    res.status(500).json({
      message: "Не удалось удалить статью",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags.split(","),
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags.split(","),
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось обновить статью",
    });
  }
};
