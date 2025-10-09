import enum


class UserSkillStatus(enum.Enum):
    """ Enum class for users skill status """
    inactive = "inactive"
    process = "process"
    complete = "complete"